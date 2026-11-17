<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SalesReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ERP Admin: Manage Commission. The platform commission (config/platform.php, 10%) per order, per seller
 * and in total for a date range, from DELIVERED or COMPLETED orders only. The CSV / print version lives in
 * Generate Reports (Commission Report tab) and uses the same SalesReport service, so numbers always match.
 */
class CommissionController extends Controller
{
    public function index(Request $request): Response
    {
        $v = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'seller_id' => ['nullable', 'integer'],
        ]);

        $to = isset($v['to']) ? \Illuminate\Support\Carbon::parse($v['to']) : now();
        $from = isset($v['from']) ? \Illuminate\Support\Carbon::parse($v['from']) : $to->copy()->startOfMonth();
        if ($from->diffInDays($to) > SalesReport::MAX_RANGE_DAYS) {
            $from = $to->copy()->subDays(SalesReport::MAX_RANGE_DAYS);
        }

        $filters = [
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
            'seller_id' => isset($v['seller_id']) ? (int) $v['seller_id'] : null,
            'status' => 'completed', 'type' => 'commission',
        ];
        $r = SalesReport::build($filters);

        return Inertia::render('admin/Commission', [
            'filters' => $filters,
            'rate' => (float) config('platform.commission_rate'),
            'summary' => $r['summary'],
            'bySeller' => $r['by_seller'],
            'byOrder' => $r['by_order'],
            'truncated' => $r['truncated'],
            'sellers' => User::where('account_type', 'seller')->orderBy('business_name')->get(['id', 'name', 'business_name'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->business_name ?: $u->name])->values(),
        ]);
    }
}
