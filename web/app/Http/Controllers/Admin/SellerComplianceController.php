<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Services\UserNotifier;
use App\Support\AccountStatus;
use App\Support\SellerCompliance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ERP Admin: Monitor Seller Compliance.
 * Lists products with the seller's registered category, flags category mismatches and
 * prohibited keywords, and lets the admin hide / remove a product or warn the seller.
 * Suspending a seller reuses UserAccountsController::updateStatus (one suspend function).
 */
class SellerComplianceController extends Controller
{
    private const PER_PAGE = 15;

    public static function flaggedCount(): int
    {
        if (! Schema::hasColumn('products', 'compliance_hidden_at')) {
            return 0;
        }
        $keywords = SellerCompliance::keywords();
        $sellers = User::where('account_type', 'seller')->get(['id', 'line_of_business'])->keyBy('id');

        return Product::query()->select(['id', 'seller_id', 'name', 'description', 'category'])->get()
            ->filter(function ($p) use ($sellers, $keywords) {
                $f = SellerCompliance::flags($p, $sellers[$p->seller_id] ?? null, $keywords);

                return $f['category_mismatch'] || $f['keywords'];
            })->count();
    }

    public function index(Request $request): Response
    {
        $f = $request->validate([
            'flag' => ['nullable', 'in:all,flagged,category,keyword,hidden'],
            'seller_id' => ['nullable', 'integer'],
            'q' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $flag = $f['flag'] ?? 'flagged';
        $keywords = SellerCompliance::keywords();

        // Heavy columns (images) are never loaded here.
        $cols = ['id', 'seller_id', 'name', 'description', 'category', 'status', 'approval_status', 'price', 'created_at'];
        if (Schema::hasColumn('products', 'compliance_hidden_at')) {
            array_push($cols, 'compliance_hidden_at', 'compliance_note');
        }

        $q = Product::query()->select($cols)->with('seller:id,name,business_name,line_of_business,status,warning_count');
        if (! empty($f['seller_id'])) {
            $q->where('seller_id', $f['seller_id']);
        }
        if (! empty($f['q'])) {
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], trim($f['q'])) . '%';
            $q->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('category', 'like', $like));
        }

        $all = $q->orderByDesc('id')->limit(1500)->get()->map(function (Product $p) use ($keywords) {
            $flags = SellerCompliance::flags($p, $p->seller, $keywords);

            return [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category,
                'price' => (float) $p->price,
                'status' => $p->status,
                'hidden' => ! empty($p->compliance_hidden_at),
                'hidden_note' => $p->compliance_note ?? null,
                'seller_id' => $p->seller_id,
                'seller' => $p->seller ? ($p->seller->business_name ?: $p->seller->name) : 'Unknown seller',
                'seller_status' => $p->seller?->status,
                'registered_category' => $p->seller?->line_of_business,
                'warnings' => (int) ($p->seller?->warning_count ?? 0),
                'category_mismatch' => $flags['category_mismatch'],
                'keywords' => $flags['keywords'],
            ];
        });

        $filtered = $all->filter(fn ($r) => match ($flag) {
            'flagged' => $r['category_mismatch'] || $r['keywords'],
            'category' => $r['category_mismatch'],
            'keyword' => (bool) $r['keywords'],
            'hidden' => $r['hidden'],
            default => true,
        })->values();

        $page = max(1, (int) ($f['page'] ?? 1));
        $slice = $filtered->slice(($page - 1) * self::PER_PAGE, self::PER_PAGE)->values();

        return Inertia::render('admin/SellerCompliance', [
            'products' => $slice,
            'filters' => ['flag' => $flag, 'seller_id' => $f['seller_id'] ?? '', 'q' => $f['q'] ?? ''],
            'counts' => [
                'all' => $all->count(),
                'category' => $all->where('category_mismatch', true)->count(),
                'keyword' => $all->filter(fn ($r) => (bool) $r['keywords'])->count(),
                'hidden' => $all->where('hidden', true)->count(),
            ],
            'pagination' => [
                'current_page' => $page, 'last_page' => max(1, (int) ceil($filtered->count() / self::PER_PAGE)),
                'total' => $filtered->count(),
            ],
            'sellers' => User::where('account_type', 'seller')->orderBy('business_name')->get(['id', 'name', 'business_name'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->business_name ?: $u->name])->values(),
            'keywordCount' => count($keywords),
        ]);
    }

    /** Issue a warning (counter on the seller + notification). */
    public function warn(Request $request, int $seller): RedirectResponse
    {
        $user = User::where('account_type', 'seller')->findOrFail($seller);
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
        ]);

        DB::transaction(function () use ($user, $data) {
            DB::table('seller_warnings')->insert([
                'seller_id' => $user->id, 'product_id' => $data['product_id'] ?? null, 'reason' => trim($data['reason']),
                'issued_by' => AccountStatus::adminLabel(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            $user->increment('warning_count');
        });

        $n = (int) $user->fresh()->warning_count;
        UserNotifier::send($user, 'compliance_warning', 'Warning from mimoo', 'You received a compliance warning: ' . trim($data['reason'])
            . " (warning #{$n}). Repeated violations can lead to account suspension.", 'compliance_warning:' . $user->id . ':' . $n,
            ['product_id' => $data['product_id'] ?? null], '/seller/products');

        return back()->with('success', 'Warning issued to ' . ($user->business_name ?: $user->name) . " (total {$n}).");
    }

    public function hide(Request $request, int $product): RedirectResponse
    {
        $p = Product::findOrFail($product);
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        $p->forceFill(['status' => 'draft', 'compliance_hidden_at' => now(), 'compliance_note' => trim($data['reason'])])->save();
        $this->tellSeller($p, 'Product hidden', "Your product \"{$p->name}\" was hidden by mimoo: " . trim($data['reason']), 'compliance_hidden:' . $p->id . ':' . now()->timestamp);

        return back()->with('success', 'Product hidden from buyers.');
    }

    public function unhide(int $product): RedirectResponse
    {
        $p = Product::findOrFail($product);
        $p->forceFill(['status' => $p->stock > 0 ? 'active' : 'out_of_stock', 'compliance_hidden_at' => null, 'compliance_note' => null])->save();
        $this->tellSeller($p, 'Product restored', "Your product \"{$p->name}\" is visible to buyers again.", 'compliance_restored:' . $p->id . ':' . now()->timestamp);

        return back()->with('success', 'Product is visible again.');
    }

    public function remove(Request $request, int $product): RedirectResponse
    {
        $p = Product::findOrFail($product);
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        $this->tellSeller($p, 'Product removed', "Your product \"{$p->name}\" was removed by mimoo: " . trim($data['reason']), 'compliance_removed:' . $p->id);
        $p->delete(); // soft delete: order history keeps working

        return back()->with('success', 'Product removed.');
    }

    private function tellSeller(Product $p, string $title, string $body, string $key): void
    {
        if ($seller = User::find($p->seller_id)) {
            UserNotifier::send($seller, 'compliance_notice', $title, $body, $key, ['product_id' => $p->id], '/seller/products');
        }
    }
}
