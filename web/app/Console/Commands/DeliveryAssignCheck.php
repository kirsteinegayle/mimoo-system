<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\CourierDeliveryController;
use App\Http\Controllers\Api\DeliveryPodPhotoController;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * CHECK for the courier delivery-rider assignment + seller POD access.
 *
 * Everything runs inside ONE database transaction that is ALWAYS rolled back,
 * and the temporary POD test file is always deleted. Net effect: no change.
 * orders.status / orders.payment_status are never written (only existing
 * orders that already have the needed status are used).
 *
 *   php artisan delivery-assign:check
 *   php artisan delivery-assign:check --courier=391
 */
class DeliveryAssignCheck extends Command
{
    protected $signature = 'delivery-assign:check {--courier= : courier users.id (default: first courier with a ready rider)}';

    protected $description = 'Rollback-only check: delivery-riders / delivery-jobs guards and seller POD access';

    private array $rows = [];

    public function handle(): int
    {
        $courier = $this->pickCourier();
        if (! $courier) {
            $this->error('No courier with an active, approved, verified rider was found.');
            return self::FAILURE;
        }
        $this->info("Courier #{$courier->id} ({$courier->email})");

        $disk     = Storage::disk('local');
        $tempFile = null;

        DB::beginTransaction();
        try {
            $ctrl = app(CourierDeliveryController::class);

            // 1. Rider list
            $res  = $ctrl->riders($this->req($courier));
            $list = $res->getData(true)['data'] ?? [];
            $this->row('GET delivery-riders', $res->getStatusCode(), 200, count($list) . ' rider(s)');

            $ready = collect($list)->first();
            if (! $ready) {
                throw new \RuntimeException('Courier has no ready rider.');
            }

            // Orders used (existing statuses only — never changed).
            $assignable = Order::whereIn('status', ['in_transit', 'shipped'])
                ->whereNotExists(fn ($q) => $q->select(DB::raw(1))->from('delivery_jobs')->whereColumn('delivery_jobs.order_id', 'orders.id'))
                ->orderBy('id')->get();
            $acceptedIds = ShipmentAssignment::where('courier_id', $courier->id)->where('assignment_status', 'accepted')->pluck('order_id');
            $noSaOrder  = $assignable->first(fn ($o) => ! $acceptedIds->contains($o->id));
            $okOrder    = $assignable->first(fn ($o) => $acceptedIds->contains($o->id));
            $removedJob = false;
            if (! $okOrder) {
                // No free order: use one accepted by this courier that already
                // has a job. Test (c) against the REAL job first, then remove
                // that job inside this (rolled-back) transaction.
                $okOrder = Order::whereIn('status', ['in_transit', 'shipped'])->whereIn('id', $acceptedIds)->orderBy('id')->first();
                if ($okOrder) {
                    $this->call404or("(c) order #{$okOrder->id} has existing job", $ctrl, $courier, $okOrder->id, $ready['personnel_id'], 422);
                    DeliveryJob::where('order_id', $okOrder->id)->delete();
                    $removedJob = true;
                }
            }
            $badStatus  = Order::whereIn('status', ['pending', 'packed', 'cancelled', 'completed'])->orderBy('id')->first();

            // 2. Validation
            try {
                $ctrl->assign($this->req($courier, 'POST', []));
                $this->row('assign: missing fields', 200, 422, 'no validation error!');
            } catch (ValidationException $e) {
                $this->row('assign: missing fields', 422, 422, implode(', ', array_keys($e->errors())));
            }

            // 3. 404 order
            $missingId = (int) Order::max('id') + 1000;
            $this->call404or('assign: order not found', $ctrl, $courier, $missingId, $ready['personnel_id'], 404);

            // 4. (a) no accepted assignment for this courier → 403
            if ($noSaOrder) {
                $this->call404or("(a) order #{$noSaOrder->id} not accepted by courier", $ctrl, $courier, $noSaOrder->id, $ready['personnel_id'], 403);
            } else {
                $this->row('(a) not accepted by courier', '-', 403, 'skipped: every assignable order is accepted by this courier');
            }

            // 5. (b) wrong order status → 422
            if ($badStatus) {
                $this->acceptFor($badStatus, $courier);
                $this->call404or("(b) order #{$badStatus->id} status {$badStatus->status}", $ctrl, $courier, $badStatus->id, $ready['personnel_id'], 422);
            } else {
                $this->row('(b) wrong order status', '-', 422, 'skipped: no such order');
            }

            if (! $okOrder) {
                throw new \RuntimeException('No in_transit/shipped order accepted by this courier.');
            }
            if ($removedJob) {
                $this->row("fixture: existing job of order #{$okOrder->id} removed", 'ok', 'ok', 'inside rollback only');
            }

            // 6. (d) personnel of ANOTHER courier → 404
            $foreign = CourierPersonnel::where('courier_id', '!=', $courier->id)->first();
            if (! $foreign && ($otherCourier = User::where('role', 'courier')->where('id', '!=', $courier->id)->first())) {
                $foreign = CourierPersonnel::create([   // fixture, rolled back
                    'courier_id' => $otherCourier->id, 'user_id' => null,
                    'name' => 'CHECK foreign rider', 'role' => 'rider', 'status' => 'active',
                ]);
            }
            if ($foreign) {
                $this->call404or('(d) rider of another courier', $ctrl, $courier, $okOrder->id, $foreign->id, 404);
            } else {
                $this->row('(d) rider of another courier', '-', 404, 'skipped: no other courier personnel');
            }

            // 7. (d) same courier but not a ready rider (no linked account) → 422
            $notReady = CourierPersonnel::create([
                'courier_id' => $courier->id, 'user_id' => null,
                'name' => 'CHECK not-ready rider', 'role' => 'rider', 'status' => 'active',
            ]);
            $this->call404or('(d) rider not approved/linked', $ctrl, $courier, $okOrder->id, $notReady->id, 422);

            // 8. Success → 201
            $res  = $ctrl->assign($this->req($courier, 'POST', ['order_id' => $okOrder->id, 'personnel_id' => $ready['personnel_id']]));
            $body = $res->getData(true);
            $jobId = $body['data']['delivery_job_id'] ?? null;
            $this->row("assign order #{$okOrder->id} → rider #{$ready['personnel_id']}", $res->getStatusCode(), 201,
                $jobId ? "job #{$jobId}, COD {$body['data']['cod_amount']}, facility " . var_export($body['data']['facility_id'], true) : ($body['message'] ?? ''));

            $statusAfter = Order::whereKey($okOrder->id)->value('status');
            $payAfter    = Order::whereKey($okOrder->id)->value('payment_status');
            $this->row('orders.status / payment_status unchanged', ($statusAfter === $okOrder->status && $payAfter === $okOrder->payment_status) ? 'yes' : 'NO', 'yes', "{$statusAfter} / {$payAfter}");
            $notif = DB::table('rider_notifications')->where('delivery_job_id', $jobId)->count();
            $this->row('rider notification created', $notif, 1, '');

            // 9. (c) second assignment → 422
            $this->call404or('(c) order already has active job', $ctrl, $courier, $okOrder->id, $ready['personnel_id'], 422);

            // 10. Seller POD access
            if ($jobId) {
                $job      = DeliveryJob::find($jobId);
                $tempFile = "rider-pod/{$jobId}/pod_" . str_repeat('C', 32) . '.jpg';
                $disk->put($tempFile, base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='));
                $job->update(['pod_photo_path' => $tempFile]);

                $pod      = app(DeliveryPodPhotoController::class);
                $sellerId = DB::table('order_items')->where('order_id', $okOrder->id)->whereNotNull('seller_id')->value('seller_id');
                if (! $sellerId && ($product = DB::table('products')->whereNotNull('seller_id')->first(['id', 'seller_id', 'name']))) {
                    // Fixture (rolled back): demo orders may have no items.
                    DB::table('order_items')->insert([
                        'order_id' => $okOrder->id, 'product_id' => $product->id, 'seller_id' => $product->seller_id,
                        'product_name' => (string) $product->name, 'quantity' => 1, 'unit_price' => 1,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                    $sellerId = $product->seller_id;
                    $this->row('fixture: order item with seller added', 'ok', 'ok', 'inside rollback only');
                }
                $owner    = $sellerId ? User::find($sellerId) : null;
                $other    = User::where(fn ($q) => $q->where('role', 'seller')->orWhere(fn ($x) => $x->whereNull('role')->where('account_type', 'seller')))
                    ->whereNotIn('id', DB::table('order_items')->where('order_id', $okOrder->id)->pluck('seller_id'))
                    ->first();

                foreach ([['seller (owner of order item)', $owner, 200], ['other seller', $other, 403], ['assigned rider', User::find($ready['user_id']), 200], ['courier', $courier, 200]] as [$label, $u, $exp]) {
                    if (! $u) { $this->row("POD: {$label}", '-', $exp, 'skipped: no such user'); continue; }
                    $r = $pod->show($this->req($u), $jobId);
                    $this->row("POD: {$label} #{$u->id}", $r->getStatusCode(), $exp, (string) $r->headers->get('Content-Type'));
                }
            }
        } catch (\Throwable $e) {
            $this->error('Stopped: ' . $e->getMessage());
        } finally {
            DB::rollBack();
            if ($tempFile) {
                $disk->delete($tempFile);
                @rmdir(dirname($disk->path($tempFile)));
            }
        }

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        $this->line('Rolled back. Temp file removed: ' . ($tempFile ? var_export(! $disk->exists($tempFile), true) : 'n/a'));

        return self::SUCCESS;
    }

    private function pickCourier(): ?User
    {
        if ($id = $this->option('courier')) {
            return User::find((int) $id);
        }
        $courierId = CourierPersonnel::where('status', 'active')->whereNotNull('user_id')
            ->whereHas('user', fn ($q) => $q->where('role', 'rider')->where('status', 'approved')->where('verification_status', 'verified'))
            ->value('courier_id');

        return $courierId ? User::find($courierId) : null;
    }

    private function acceptFor(Order $order, User $courier): void
    {
        $exists = ShipmentAssignment::where('order_id', $order->id)->where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted')->exists();
        if (! $exists) {
            ShipmentAssignment::create([
                'order_id' => $order->id, 'courier_id' => $courier->id, 'assigned_by' => $courier->id,
                'assigned_at' => now(), 'assignment_status' => 'accepted', 'accepted_at' => now(),
                'acceptance_deadline' => now()->addDay(),
            ]);
        }
    }

    private function call404or(string $label, CourierDeliveryController $ctrl, User $courier, int $orderId, int $personnelId, int $expected): void
    {
        $res = $ctrl->assign($this->req($courier, 'POST', ['order_id' => $orderId, 'personnel_id' => $personnelId]));
        $this->row($label, $res->getStatusCode(), $expected, $res->getData(true)['message'] ?? '');
    }

    private function req(User $user, string $method = 'GET', array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function row(string $check, $got, $expected, string $note): void
    {
        $mark = (string) $got === (string) $expected ? '' : '  ✗';
        $this->rows[] = [$check, $got . $mark, $expected, mb_strimwidth($note, 0, 70, '…')];
    }
}
