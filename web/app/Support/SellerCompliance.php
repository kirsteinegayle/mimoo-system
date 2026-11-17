<?php

namespace App\Support;

use App\Models\AdminSetting;
use App\Models\Product;
use App\Models\User;

/**
 * Seller compliance rules:
 *  - category check: the product's category must belong to the seller's registered business category
 *  - prohibited keywords (managed in Platform Settings): matched in the product name / description
 */
class SellerCompliance
{
    public const KEYWORDS_KEY = 'prohibited_keywords';

    /** Registered business category => product categories it may sell. "Other"/empty = no restriction. */
    public const CATEGORY_MAP = [
        'Food & Beverage' => ['Food and Gourmet'],
        'Fashion & Apparel' => ["Women's Apparel", "Men's Apparel", 'Kids and Baby', 'Jewelry and Watches'],
        'Health & Beauty' => ['Health and Beauty'],
        'Home & Living' => ['Home and Garden', 'Furniture and Decor'],
        'Electronics & Gadgets' => ['Electronics and Gadgets'],
        'Pet Supplies' => ['Pet Supplies'],
        'Arts & Crafts' => ['Books and Media', 'Home and Garden', 'Furniture and Decor'],
    ];

    /** @return list<string> */
    public static function keywords(): array
    {
        $raw = json_decode((string) AdminSetting::get(self::KEYWORDS_KEY, '[]'), true);

        return is_array($raw) ? array_values(array_filter(array_map('strval', $raw))) : [];
    }

    public static function saveKeywords(array $keywords): void
    {
        AdminSetting::put(self::KEYWORDS_KEY, json_encode(array_values($keywords)));
    }

    /** True when the product's category does not fit the seller's registered category. */
    public static function categoryMismatch(?string $registered, ?string $productCategory): bool
    {
        $registered = trim((string) $registered);
        $productCategory = trim((string) $productCategory);
        if ($registered === '' || ! isset(self::CATEGORY_MAP[$registered]) || $productCategory === '' || $productCategory === 'Others') {
            return false; // "Other" / unknown / uncategorised: nothing to compare
        }

        return ! in_array($productCategory, self::CATEGORY_MAP[$registered], true);
    }

    /** @return list<string> keywords found as whole words in the product text */
    public static function matchedKeywords(Product $p, array $keywords): array
    {
        $text = mb_strtolower($p->name . ' ' . $p->description);
        $hits = [];
        foreach ($keywords as $k) {
            if ($k !== '' && preg_match('/(?<![\p{L}\p{N}])' . preg_quote($k, '/') . '(?![\p{L}\p{N}])/u', $text)) {
                $hits[] = $k;
            }
        }

        return $hits;
    }

    /** @return array{category_mismatch:bool, keywords:list<string>} */
    public static function flags(Product $p, ?User $seller, array $keywords): array
    {
        return [
            'category_mismatch' => self::categoryMismatch($seller?->line_of_business, $p->category),
            'keywords' => self::matchedKeywords($p, $keywords),
        ];
    }
}
