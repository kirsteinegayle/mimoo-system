<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderPickupController;
use App\Http\Controllers\Api\RiderWalletController;
use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\RiderEarning;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests: a rider's pickup scan records ONE pickup earning
 * (RiderEarning::PICKUP_RATE) and it shows in the rider wallet.
 *
 * Fixture rider/personnel/assignment are created inside ONE transaction that
 * is ALWAYS rolled back. orders.* is never written. Demo data is not touched.
 *
 *   php artisan rider:test-pickup-earning
 */
class RiderTestPickupEarning extends Command
{
    protected $signature = 'rider:test-pickup-earning';

    protected $description = 'Rollback-only tests: pickup scan -> one rider_earnings row (type pickup), shown in the wallet';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        // An order with a waybill and no active shipment assignment (one active per order).
        $order = Order::whereNotNull('waybill_number')
            ->whereNotExists(fn ($q) => $q->select(DB::raw(1))->from('shipment_assignments')
                ->whereColumn('shipment_assignments.order_id', 'orders.id')
                ->whereIn('assignment_status', ['pending', 'accepted'])
                ->where('pickup_status', '<>', 'cancelled'))
            ->orderBy('id')->first();
        $courier = User::where('role', 'courier')->orderBy('id')->first()
            ?? User::where('account_type', 'logistics')->orderBy('id')->first();
        if (! $order || ! $courier) {
            $this->error('Need an order with a waybill (no active assignment) and a courier account.');
            return self::FAILURE;
        }

        $counts      = $this->counts();
        $orderBefore = Order::whereKey($order->id)->first(['status', 'payment_status', 'updated_at'])->toArray();

        DB::beginTransaction();
        try {
            $this->runTests($order, $courier);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));
        $orderAfter = Order::whereKey($order->id)->first(['status', 'payment_status', 'updated_at'])->toArray();
        $this->check('orders row unchanged', $orderAfter === $orderBefore ? 'yes' : 'NO', 'yes', "order #{$order->id}");

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(Order $order, User $courier): void
    {
        $pickup = app(RiderPickupController::class);
        $wallet = app(RiderWalletController::class);
        $rate   = number_format(RiderEarning::PICKUP_RATE, 2, '.', '');

        [$rider, $personnel] = $this->makeRider($courier, 'a');
        [$otherRider]        = $this->makeRider($courier, 'b');

        $sa = ShipmentAssignment::create([
            'order_id'              => $order->id,
            'courier_id'            => $courier->id,
            'assigned_by'           => $courier->id,
            'assigned_at'           => now(),
            'assignment_status'     => 'accepted',
            'accepted_at'           => now(),
            'acceptance_deadline'   => now()->addDay(),
            'pickup_status'         => 'scheduled',
            'assigned_personnel_id' => $personnel->id,
        ]);
        $this->check('fixture: rider, other rider, scheduled pickup', 'ok', 'ok', "assignment #{$sa->id}, order #{$order->id}, rate {$rate}");

        $earnings = fn () => RiderEarning::where('shipment_assignment_id', $sa->id)->count();
        $w0 = $this->hit(fn () => $wallet->earnings($this->req($rider, 'GET')))['body']['data'] ?? [];

        // 1. Guards: no earning without a real pickup
        $r = $this->hit(fn () => $pickup->scan($this->req($rider, 'POST', ['waybill_number' => 'WRONG-' . Str::random(4)]), $sa->id));
        $this->check('wrong waybill', $r['status'] . '/' . $earnings(), '422/0', $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $pickup->scan($this->req($otherRider, 'POST', ['waybill_number' => $order->waybill_number]), $sa->id));
        $this->check('other rider scan', $r['status'] . '/' . $earnings(), '404/0', $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $pickup->scan($this->req($rider, 'POST', []), $sa->id));
        $this->check('missing waybill', $r['status'] . '/' . $earnings(), '422/0', $r['body']['message'] ?? '');

        // 2. Real pickup -> one earning
        $r = $this->hit(fn () => $pickup->scan($this->req($rider, 'POST', ['waybill_number' => $order->waybill_number]), $sa->id));
        $this->check('rider scan (picked up)', $r['status'] . '/' . json_encode($r['body']['earned'] ?? null), '200/' . json_encode(RiderEarning::PICKUP_RATE), $r['body']['message'] ?? '');
        $this->check('assignment pickup_status', ShipmentAssignment::whereKey($sa->id)->value('pickup_status'), 'picked_up', 'picked_up_by ' . ShipmentAssignment::whereKey($sa->id)->value('picked_up_by'));

        $e = RiderEarning::where('shipment_assignment_id', $sa->id)->first();
        $this->check('earning rows for this pickup', $earnings(), 1, '');
        $this->check('earning type / amount', ($e?->type ?? '-') . '/' . ($e?->amount ?? '-'), "pickup/{$rate}", '');
        $this->check('earning rider / order', ($e?->rider_user_id ?? '-') . '/' . ($e?->order_id ?? '-'), "{$rider->id}/{$order->id}", 'delivery_job_id ' . json_encode($e?->delivery_job_id));
        $this->check('other rider has no earning', RiderEarning::where('rider_user_id', $otherRider->id)->count(), 0, '');

        // 3. Idempotent: repeat request, and a raw duplicate insert
        $r = $this->hit(fn () => $pickup->scan($this->req($rider, 'POST', ['waybill_number' => $order->waybill_number]), $sa->id));
        $this->check('scan again (idempotent)', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . $earnings(), '200/true/1', $r['body']['message'] ?? '');
        try {
            DB::table('rider_earnings')->insert([
                'rider_user_id' => $rider->id, 'shipment_assignment_id' => $sa->id, 'order_id' => $order->id,
                'type' => 'pickup', 'amount' => RiderEarning::PICKUP_RATE, 'earned_at' => now(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            $dup = 'inserted';
        } catch (\Illuminate\Database\QueryException) {
            $dup = 'blocked';
        }
        $this->check('raw duplicate insert (DB unique)', $dup . '/' . $earnings(), 'blocked/1', 'shipment_assignment_id is unique');

        // 4. Wallet
        $w1 = $this->hit(fn () => $wallet->earnings($this->req($rider, 'GET')))['body']['data'] ?? [];
        $this->check('wallet today +rate / +1', number_format(($w1['today'] ?? 0) - ($w0['today'] ?? 0), 2, '.', '') . '/+' . (($w1['today_count'] ?? 0) - ($w0['today_count'] ?? 0)), "{$rate}/+1", 'today=' . ($w1['today'] ?? '?'));
        $this->check('wallet week +rate', number_format(($w1['week'] ?? 0) - ($w0['week'] ?? 0), 2, '.', ''), $rate, 'week=' . ($w1['week'] ?? '?'));
        $hist = $this->hit(fn () => $pickup->history($this->req($rider, 'GET')));
        $this->check('pickup in rider history', collect($hist['body']['data'] ?? [])->pluck('id')->contains($sa->id) ? 'yes' : 'no', 'yes', '');
    }

    private function makeRider(User $courier, string $tag): array
    {
        $user = new User();
        $user->forceFill([
            'name'                => "Pickup Earning Test {$tag}",
            'first_name'          => 'Pickup',
            'last_name'           => "Test {$tag}",
            'email'               => "pickup-earning.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'            => Str::random(32),
            'account_type'        => 'logistics',
            'role'                => 'rider',
            'status'              => 'approved',
            'verification_status' => 'verified',
        ])->save();
        $personnel = CourierPersonnel::create([
            'courier_id' => $courier->id, 'user_id' => $user->id,
            'name' => "Pickup Test Rider {$tag}", 'role' => 'rider', 'status' => 'active',
        ]);
        return [$user, $personnel];
    }

    /** Runs a controller call; ValidationException becomes a 422 row. */
    private function hit(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ValidationException $e) {
            return ['status' => 422, 'body' => ['message' => $e->getMessage()]];
        }
    }

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function counts(): array
    {
        return [
            'rider_earnings'       => DB::table('rider_earnings')->count(),
            'shipment_assignments' => DB::table('shipment_assignments')->count(),
            'users'                => DB::table('users')->count(),
            'courier_personnel'    => DB::table('courier_personnel')->count(),
        ];
    }

    private function check(string $label, $got, $expected, string $note): void
    {
        $ok = (string) $got === (string) $expected;
        if (! $ok) {
            $this->failed++;
        }
        $this->rows[] = [$label, $got . ($ok ? '' : '  ✗'), $expected, Str::limit($note, 70)];
    }
}
