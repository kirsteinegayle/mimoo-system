<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\Product;
use App\Models\ProductReport;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Builds admin notifications from the events the admin team acts on, using the
 * same rules as the admin queues (AdminController). Idempotent: each event has
 * a unique source_key, so running sync() again never duplicates a row and
 * never touches read_at. Read-only on every other table.
 */
class AdminNotificationService
{
    /** Only look back this far so a first sync on an old database stays small. */
    private const LOOKBACK_DAYS = 60;

    private const PER_TYPE = 100;

    public static function sync(): int
    {
        if (! Schema::hasTable('admin_notifications')) {
            return 0;
        }

        $since = now()->subDays(self::LOOKBACK_DAYS);
        $rows  = [];

        // Seller applications waiting for review (same queue as Seller Approval).
        User::where('account_type', 'seller')->where('verification_status', 'verified')->where('status', 'pending')
            ->where('created_at', '>=', $since)->latest('id')->limit(self::PER_TYPE)
            ->get(['id', 'name', 'business_name', 'created_at'])
            ->each(function ($u) use (&$rows) {
                $rows[] = ['seller_application', "seller_application:{$u->id}", 'New seller application',
                    ($u->business_name ?: $u->name) . ' applied to sell on mimoo.', '/admin/seller-approval', $u->created_at];
            });

        // Logistics company applications (same queue as Logistics Approval).
        User::where('account_type', 'logistics')->where('role', 'logistics_staff')->where('verification_status', 'verified')
            ->where('status', 'pending')->where('created_at', '>=', $since)->latest('id')->limit(self::PER_TYPE)
            ->get(['id', 'name', 'company_name', 'created_at'])
            ->each(function ($u) use (&$rows) {
                $rows[] = ['logistics_application', "logistics_application:{$u->id}", 'New logistics application',
                    ($u->company_name ?: $u->name) . ' applied as a logistics partner.', '/admin/logistics-approval', $u->created_at];
            });

        // Products waiting for approval.
        Product::where('approval_status', 'pending')->where('created_at', '>=', $since)->latest('id')->limit(self::PER_TYPE)
            ->get(['id', 'name', 'created_at'])
            ->each(function ($p) use (&$rows) {
                $rows[] = ['product_approval', "product_approval:{$p->id}", 'Product awaiting approval',
                    Str::limit((string) $p->name, 120), '/admin/product-approval', $p->created_at];
            });

        // Product reports from buyers.
        ProductReport::where('status', 'pending')->where('created_at', '>=', $since)->latest('id')->limit(self::PER_TYPE)
            ->with('product:id,name')->get()
            ->each(function ($r) use (&$rows) {
                $rows[] = ['product_report', "product_report:{$r->id}", 'Product reported',
                    'Reason: ' . Str::headline((string) $r->reason) . ($r->product ? ' · ' . Str::limit($r->product->name, 80) : ''),
                    '/admin/reports', $r->created_at];
            });

        // Return requests escalated to the admin team.
        ReturnRequest::where('status', 'escalated')->whereNotNull('escalated_at')->where('escalated_at', '>=', $since)
            ->latest('id')->limit(self::PER_TYPE)->get(['id', 'order_id', 'reason', 'escalated_at'])
            ->each(function ($rr) use (&$rows) {
                $rows[] = ['return_escalated', "return_escalated:{$rr->id}", 'Return escalated',
                    'Order MIM-' . str_pad((string) $rr->order_id, 8, '0', STR_PAD_LEFT) . ' · ' . Str::limit((string) $rr->reason, 80),
                    '/admin/returns', $rr->escalated_at];
            });

        $created = 0;
        foreach ($rows as [$type, $key, $title, $body, $link, $at]) {
            $n = AdminNotification::firstOrCreate(['source_key' => $key], [
                'type' => $type, 'title' => $title, 'body' => $body, 'link' => $link,
            ]);
            if ($n->wasRecentlyCreated) {
                // Keep the event's own time so the list is in real order.
                $n->forceFill(['created_at' => $at ?? now(), 'updated_at' => now()])->saveQuietly();
                $created++;
            }
        }

        return $created;
    }
}
