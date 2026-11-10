<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\DeliveryPodPhotoController;
use App\Models\DeliveryJob;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

/**
 * READ-ONLY check for GET /api/delivery-jobs/{id}/pod-photo.
 *
 * Calls DeliveryPodPhotoController::show() in-process as different users and
 * prints the HTTP status each one gets. Creates no tokens, writes nothing.
 *
 *   php artisan pod:check-access            (latest delivery job)
 *   php artisan pod:check-access 32
 */
class PodPhotoCheck extends Command
{
    protected $signature = 'pod:check-access {job? : delivery_jobs.id (default: latest)}';

    protected $description = 'Read-only: show which users get 200/403/404 on the POD photo endpoint';

    public function handle(): int
    {
        $job = $this->argument('job')
            ? DeliveryJob::with('order:id,buyer_id')->find((int) $this->argument('job'))
            : DeliveryJob::with('order:id,buyer_id')->latest('id')->first();

        if (! $job) {
            $this->error('No delivery job found.');
            return self::FAILURE;
        }

        $this->info("Job #{$job->id} (order #{$job->order_id}, status {$job->status}, photo: "
            . ($job->pod_photo_path ? 'yes' : 'no') . ')');

        $role = fn ($q, string $r) => $q->where(fn ($w) => $w->where('role', $r)
            ->orWhere(fn ($x) => $x->whereNull('role')->where('account_type', $r)));

        $cases = [
            ['buyer (owner)',         $job->order ? User::find($job->order->buyer_id) : null, '200 (or 404 if no photo)'],
            ['rider (owner)',         User::find($job->rider_user_id),                         '200 (or 404 if no photo)'],
            ['courier (owner)',       $job->courier_id ? User::find($job->courier_id) : null,  '200 (or 404 if no photo)'],
            ['logistics_staff',       $role(User::query(), 'logistics_staff')->first(),        '200 (or 404 if no photo)'],
            ['other buyer',           User::where('account_type', 'buyer')->where('id', '!=', $job->order?->buyer_id ?? 0)->first(), '403'],
            ['other rider',           $role(User::query(), 'rider')->where('id', '!=', $job->rider_user_id ?? 0)->first(), '403'],
            ['other courier',         $role(User::query(), 'courier')->where('id', '!=', $job->courier_id ?? 0)->first(), '403'],
            ['seller',                $role(User::query(), 'seller')->first(),                 '403'],
        ];

        $controller = app(DeliveryPodPhotoController::class);
        $rows = [];

        foreach ($cases as [$label, $user, $expected]) {
            if (! $user) {
                $rows[] = [$label, '-', 'skipped (no such user)', $expected];
                continue;
            }
            $rows[] = [$label, "#{$user->id}", $this->statusFor($controller, $user, $job->id), $expected];
        }

        // Missing job → 404 for anyone allowed to call it.
        $any = User::find($job->rider_user_id) ?? User::first();
        if ($any) {
            $missing = (int) DeliveryJob::max('id') + 1000;
            $rows[] = ["missing job #{$missing}", "#{$any->id}", $this->statusFor($controller, $any, $missing), '404'];
        }

        $this->table(['Caller', 'User', 'Status', 'Expected'], $rows);

        return self::SUCCESS;
    }

    private function statusFor(DeliveryPodPhotoController $controller, User $user, int $jobId): int
    {
        $request = Request::create("/api/delivery-jobs/{$jobId}/pod-photo", 'GET');
        $request->setUserResolver(fn () => $user);

        return $controller->show($request, $jobId)->getStatusCode();
    }
}
