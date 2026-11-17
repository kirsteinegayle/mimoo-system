<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin "Generate Reports" (ERP components doc): Sales Summary Report and
 * Commission Report, filtered by date range / seller / order status.
 *
 * Sales are measured per order item (quantity x unit_price) so a multi-seller
 * order is split correctly; commission = platform rate x item sales.
 */
class AdminReportsController extends Controller
{
        public function page(Request $request): Response
    {
        $f = $this->filters($request);

        return Inertia::render('admin/GenerateReports', [
            'filters' => $f,
            'report' => \App\Services\SalesReport::build($f),
            'sellers' => User::where('account_type', 'seller')->orderBy('business_name')
                ->get(['id', 'name', 'business_name'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->business_name ?: $u->name])->values(),
            'commissionRate' => (float) config('platform.commission_rate'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $f = $this->filters($request);
        $r = \App\Services\SalesReport::build($f);
        $type = $f['type'];
        $name = sprintf('%s-report_%s_to_%s.csv', $type, $f['from'], $f['to']);

        return response()->streamDownload(function () use ($r, $f, $type) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel shows peso signs/accents correctly
            $csv = fn (array $row) => fputcsv($out, array_map([$this, 'safeCell'], $row), ',', '"', '');

            $csv([$type === 'commission' ? 'Commission Report' : 'Sales Summary Report']);
            $csv(['Period', $f['from'] . ' to ' . $f['to']]);
            $csv(['Commission rate', ($r['summary']['commission_rate'] * 100) . '%']);
            $csv([]);
            $csv(['Orders', 'Items sold', 'Gross sales', 'Commission', 'Seller net']);
            $s = $r['summary'];
            $csv([$s['orders'], $s['items'], $s['gross_sales'], $s['commission'], $s['seller_net']]);
            $csv([]);

            $csv(['By seller']);
            $csv(['Seller', 'Orders', 'Items sold', 'Gross sales', 'Commission', 'Seller net']);
            foreach ($r['by_seller'] as $row) {
                $csv([$row['seller'], $row['orders'], $row['items'], $row['gross_sales'], $row['commission'], $row['seller_net']]);
            }
            $csv([]);

            $csv(['By day']);
            $csv(['Date', 'Orders', 'Gross sales', 'Commission']);
            foreach ($r['by_day'] as $row) {
                $csv([$row['date'], $row['orders'], $row['gross_sales'], $row['commission']]);
            }
            $csv([]);

            $csv(['Order lines']);
            $csv(['Order #', 'Date', 'Seller', 'Product', 'Qty', 'Unit price', 'Line total', 'Commission', 'Status']);
            foreach ($r['lines'] as $row) {
                $csv([$row['order_number'], $row['date'], $row['seller'], $row['product'], $row['quantity'], $row['unit_price'], $row['line_total'], $row['commission'], $row['status']]);
            }
            fclose($out);
        }, $name, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Neutralise spreadsheet formula injection in user-supplied text (seller / product names). */
    private function safeCell(mixed $v): mixed
    {
        return is_string($v) && $v !== '' && in_array($v[0], ['=', '+', '-', '@', "\t", "\r"], true) ? "'" . $v : $v;
    }

    /** @return array{from:string,to:string,seller_id:?int,status:string,type:string} */
    private function filters(Request $request): array
    {
        $v = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'seller_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:completed,all'],
            'type' => ['nullable', 'in:sales,commission'],
        ]);

        $to = isset($v['to']) ? \Illuminate\Support\Carbon::parse($v['to']) : now();
        $from = isset($v['from']) ? \Illuminate\Support\Carbon::parse($v['from']) : $to->copy()->subDays(29);
        if ($from->diffInDays($to) > \App\Services\SalesReport::MAX_RANGE_DAYS) {
            $from = $to->copy()->subDays(\App\Services\SalesReport::MAX_RANGE_DAYS);
        }

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'seller_id' => isset($v['seller_id']) ? (int) $v['seller_id'] : null,
            'status' => $v['status'] ?? 'completed',
            'type' => $v['type'] ?? 'sales',
        ];
    }
}
