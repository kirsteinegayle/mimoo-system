<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductReport;
use App\Models\User;

/**
 * One set of rules for buyer product reports, used by the web endpoint
 * (POST /api/products/{id}/report, session) and the buyer mobile API
 * (POST /api/buyer/products/{id}/report, Sanctum). Each caller keeps its own
 * response shape.
 *
 * Rules: reason in REASONS, description 1–500 chars, product must exist (not
 * soft-deleted), no report on your own product, and no second report while
 * your previous report for the same product is still pending.
 */
class ProductReportService
{
    public const REASONS = ['misleading', 'inappropriate', 'counterfeit', 'spam', 'other'];

    public const MAX_DESCRIPTION = 500;

    public const ERR_DUPLICATE = 'duplicate';
    public const ERR_OWN       = 'own_product';

    public static function rules(): array
    {
        return [
            'reason'      => 'required|string|in:' . implode(',', self::REASONS),
            'description' => 'required|string|max:' . self::MAX_DESCRIPTION,
        ];
    }

    public static function messages(): array
    {
        return [
            'reason.required'      => 'Please select a reason for reporting.',
            'description.required' => 'Please provide details about why you are reporting this product.',
        ];
    }

    /**
     * Creates the report for already-validated input.
     *
     * @return array{error: ?string, report: ?ProductReport}
     */
    public static function submit(User $user, Product $product, array $validated): array
    {
        if ((int) $product->seller_id === (int) $user->id) {
            return ['error' => self::ERR_OWN, 'report' => null];
        }

        $pending = ProductReport::where('product_id', $product->id)
            ->where('reported_by', $user->id)
            ->where('status', 'pending')
            ->exists();
        if ($pending) {
            return ['error' => self::ERR_DUPLICATE, 'report' => null];
        }

        $report = ProductReport::create([
            'product_id'  => $product->id,
            'reported_by' => $user->id,
            'reason'      => $validated['reason'],
            'description' => $validated['description'],
            'status'      => 'pending',
        ]);

        return ['error' => null, 'report' => $report];
    }
}
