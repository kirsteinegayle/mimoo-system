<?php

namespace App\Services;

use App\Models\BuyerNotification;
use App\Models\Product;
use App\Models\ProductReport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Notifications when an admin decides a product report. Never throws; rows
 * are inserted after the surrounding transaction commits.
 *
 *  Buyer (reporter), on approved AND rejected: one buyer_notification
 *    type product_report, data {report_id, product_id, status, url};
 *    skipped when a row for the same report + status already exists.
 *    Admin notes are NOT shared (they are internal).
 *  Seller, only on approved (product removed): one seller_notification
 *    type product_removed, dedupe_key product_removed:{product_id}
 *    (UNIQUE seller_id + dedupe_key, insertOrIgnore). Never contains the
 *    reporter's name, id or the report text. No seller row when rejected.
 */
class ProductReportNotificationService
{
    public const BUYER_TYPE  = 'product_report';
    public const SELLER_TYPE = 'product_removed';

    /** @param Product|null $product the reported product, loaded BEFORE any delete */
    public static function reviewed(ProductReport $report, ?Product $product): void
    {
        try {
            $status = $report->status;
            if (! in_array($status, ['approved', 'rejected'], true)) {
                return;
            }
            $reportId  = (int) $report->id;
            $buyerId   = (int) $report->reported_by;
            $productId = (int) $report->product_id;
            $name      = $product ? Str::limit((string) $product->name, 60) : 'the product';

            [$body, $url] = $status === 'approved'
                ? ["Thanks for your report. We reviewed \"{$name}\" and removed it from the store.", '/buyer/notifications']
                : ["We reviewed your report on \"{$name}\" and found no policy violation. The product stays listed.", '/product/' . $productId];

            DB::afterCommit(function () use ($reportId, $buyerId, $productId, $status, $body, $url) {
                try {
                    $exists = BuyerNotification::where('buyer_id', $buyerId)
                        ->where('type', self::BUYER_TYPE)
                        ->where('data->report_id', $reportId)
                        ->where('data->status', $status)
                        ->exists();
                    if ($exists || ! $buyerId) {
                        return;
                    }
                    BuyerNotification::create([
                        'buyer_id' => $buyerId,
                        'type'     => self::BUYER_TYPE,
                        'title'    => 'Your report was reviewed',
                        'body'     => $body,
                        'data'     => ['report_id' => $reportId, 'product_id' => $productId, 'status' => $status, 'url' => $url],
                    ]);
                } catch (\Throwable $e) {
                    Log::warning('Product report buyer notification failed: ' . $e->getMessage());
                }
            });

            if ($status === 'approved' && $product && $product->seller_id) {
                $sellerId = (int) $product->seller_id;
                DB::afterCommit(function () use ($sellerId, $productId, $name) {
                    try {
                        $now = now();
                        DB::table('seller_notifications')->insertOrIgnore([
                            'seller_id'  => $sellerId,
                            'type'       => self::SELLER_TYPE,
                            'title'      => 'Product removed',
                            'message'    => "Your product \"{$name}\" was removed after a policy review. Contact support if you think this is a mistake.",
                            'data'       => json_encode(['product_id' => $productId]),
                            'url'        => '/seller/products',
                            'dedupe_key' => 'product_removed:' . $productId,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    } catch (\Throwable $e) {
                        Log::warning('Product report seller notification failed: ' . $e->getMessage());
                    }
                });
            }
        } catch (\Throwable $e) {
            Log::warning('Product report notification failed: ' . $e->getMessage());
        }
    }
}
