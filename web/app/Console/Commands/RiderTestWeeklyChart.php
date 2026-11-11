<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderWalletController;
use App\Models\RiderEarning;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Rollback-only tests for GET /api/rider-app/earnings -> data.days
 * (rider wallet weekly chart: last 7 days, 0.00 on days without earnings).
 *
 * Fixture riders and earnings are created inside ONE transaction that is
 * ALWAYS rolled back. orders.* and demo data are never touched.
 *
 *   php artisan rider:test-weekly-chart
 */
class RiderTestWeeklyChart extends Command
{
    protected $signature = 'rider:test-weekly-chart';

    protected $description = 'Rollback-only tests: rider wallet per-day earnings for the last 7 days';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $before = DB::table('rider_earnings')->count() . '/' . DB::table('users')->count();

        DB::beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = DB::table('rider_earnings')->count() . '/' . DB::table('users')->count();
        $this->check('rollback: earnings/users unchanged', $after, $before, '');

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(): void
    {
        $wallet = app(RiderWalletController::class);
        $rider  = $this->makeRider('a');
        $other  = $this->makeRider('b');

        // Fixture earnings (days ago => [type, amount]...)
        $plan = [
            0 => [['pickup', 20.00], ['delivery', 50.00]],
            2 => [['delivery', 50.00]],
            4 => [['pickup', 20.00], ['bonus', 15.00]],   // 'bonus' = any other type
            7 => [['delivery', 50.00]],                   // outside the 7-day window
        ];
        foreach ($plan as $ago => $items) {
            foreach ($items as [$type, $amount]) {
                $this->earn($rider, $type, $amount, $ago);
            }
        }
        $this->earn($other, 'delivery', 999.00, 0);
        $this->check('fixture: 2 riders + earnings', 'ok', 'ok', 'rider a: days 0,2,4 (+7 outside); rider b: 999 today');

        $data = $wallet->earnings($this->req($rider))->getData(true)['data'] ?? [];
        $days = collect($data['days'] ?? []);

        // 1. Shape: 7 consecutive days ending today
        $expectedDates = collect(range(6, 0))->map(fn ($ago) => now()->startOfDay()->subDays($ago)->toDateString())->all();
        $this->check('7 days returned', $days->count(), 7, '');
        $this->check('dates: 6 days ago .. today', $days->pluck('date')->all() === $expectedDates ? 'yes' : 'NO', 'yes', $days->first()['date'] . ' .. ' . $days->last()['date']);
        $this->check('last label', $days->last()['label'] ?? '-', 'Today', 'first: ' . ($days->first()['label'] ?? '-'));

        // 2. Totals per day (oldest first: 6..0 days ago)
        $want = [6 => 0.0, 5 => 0.0, 4 => 35.0, 3 => 0.0, 2 => 50.0, 1 => 0.0, 0 => 70.0];
        $got  = [];
        foreach ($days as $i => $d) {
            $got[6 - $i] = (float) $d['total'];
        }
        $this->check('totals per day (6..0 ago)', json_encode(array_values($got)), json_encode(array_values($want)), 'includes 0.00 days');
        $zero = $days->filter(fn ($d) => in_array($d['date'], [$expectedDates[0], $expectedDates[1], $expectedDates[3], $expectedDates[5]], true));
        $this->check('empty days are 0.00 / 0 count', $zero->every(fn ($d) => (float) $d['total'] === 0.0 && $d['count'] === 0) ? 'yes' : 'NO', 'yes', $zero->count() . ' empty days');

        // 3. Type split
        $today = $days->last();
        $this->check('today pickup + delivery = total', "{$today['pickup']}+{$today['delivery']}={$today['total']}", '20+50=70', "counts {$today['pickup_count']}/{$today['delivery_count']}");
        $d4 = $days->firstWhere('date', $expectedDates[2]);
        $this->check('other type summed into total', "{$d4['pickup']}+{$d4['other']}={$d4['total']}", '20+15=35', '4 days ago');
        $this->check('day 7 ago excluded', $days->pluck('date')->contains(now()->startOfDay()->subDays(7)->toDateString()) ? 'present' : 'excluded', 'excluded', '');

        // 4. Other rider not included
        $this->check('other rider not included', (float) $today['total'], 70.0, 'rider b has 999 today');
        $otherToday = collect($wallet->earnings($this->req($other))->getData(true)['data']['days'] ?? [])->last();
        $this->check('other rider sees only own', (float) ($otherToday['total'] ?? -1), 999.0, '');

        // 5. Same numbers as the existing totals
        $this->check('today total = data.today', (float) $today['total'], (float) $data['today'], 'today_count ' . $data['today_count']);
        $weekStart = now()->startOfWeek()->toDateString();
        $inWeek    = $days->filter(fn ($d) => $d['date'] >= $weekStart);
        $this->check('days in this week = data.week', round((float) $inWeek->sum('total'), 2), round((float) $data['week'], 2), "week starts {$weekStart}; {$inWeek->count()} chart day(s) in week");
        $this->check('day counts in week = week_count', $inWeek->sum('count'), $data['week_count'], '');
        $this->check('existing fields kept', collect(['today', 'today_count', 'week', 'week_count'])->every(fn ($k) => array_key_exists($k, $data)) ? 'yes' : 'NO', 'yes', '');
    }

    private function earn(User $rider, string $type, float $amount, int $daysAgo): void
    {
        RiderEarning::create([
            'rider_user_id' => $rider->id,
            'type'          => $type,
            'amount'        => $amount,
            'earned_at'     => now()->startOfDay()->subDays($daysAgo)->addMinute(),
        ]);
    }

    private function makeRider(string $tag): User
    {
        $user = new User();
        $user->forceFill([
            'name'                => "Weekly Chart Test {$tag}",
            'first_name'          => 'Weekly',
            'last_name'           => "Test {$tag}",
            'email'               => "weekly-chart.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'            => Str::random(32),
            'account_type'        => 'logistics',
            'role'                => 'rider',
            'status'              => 'approved',
            'verification_status' => 'verified',
        ])->save();
        return $user;
    }

    private function req(User $user): Request
    {
        $r = Request::create('/check', 'GET');
        $r->setUserResolver(fn () => $user);
        return $r;
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
