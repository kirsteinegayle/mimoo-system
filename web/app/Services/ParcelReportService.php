<?php

namespace App\Services;

use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ParcelReport;
use App\Models\ShipmentAssignment;
use App\Models\User;

/**
 * One set of rules for parcel problem reports (web + buyer/rider/courier apps).
 *
 *  Who may report an order (else 404, so other people's orders are not revealed):
 *    buyer   - the order's buyer, once it has shipped (shipped / in_transit / completed / failed)
 *    rider   - the rider of a delivery job for that order
 *    courier - the courier company assigned to it (orders.assigned_courier_id or an accepted assignment)
 *  One ACTIVE report (open or reviewed) per order per reporter; resolved ones allow a new report.
 *  Admin: open -> reviewed -> resolved (or open -> resolved). resolved is final.
 *  The reporter is notified on reviewed / resolved with a fixed text: the admin's
 *  internal note and other people's identity are never included.
 */
class ParcelReportService
{
    public const REASONS = [
        'damaged'      => 'Damaged parcel',
        'lost'         => 'Lost parcel',
        'wrong_item'   => 'Wrong item',
        'not_received' => 'Not received',
        'other'        => 'Other problem',
    ];

    public const ROLES = ['buyer', 'rider', 'courier'];

    public const STATUSES = ['open', 'reviewed', 'resolved'];

    public const ACTIVE = ['open', 'reviewed'];

    public const BUYER_STATUSES = ['shipped', 'in_transit', 'completed', 'failed'];

    public const MAX_DESCRIPTION = 1000;

    public const NOTIFY_TYPE = 'parcel_report';

    public const ERR_DUPLICATE  = 'duplicate';
    public const ERR_NOT_YET    = 'not_shipped';
    public const ERR_TRANSITION = 'invalid_transition';

    public static function rules(): array
    {
        return [
            'reason'      => 'required|string|in:' . implode(',', array_keys(self::REASONS)),
            'description' => 'required|string|min:5|max:' . self::MAX_DESCRIPTION,
        ];
    }

    public static function messages(): array
    {
        return [
            'reason.required'      => 'Please choose what went wrong with the parcel.',
            'reason.in'            => 'Please choose a valid problem type.',
            'description.required' => 'Please describe the problem.',
            'description.min'      => 'Please add a few more details (at least 5 characters).',
        ];
    }

    /** The order this user may report as $role, or null (=> 404). */
    public static function orderFor(User $user, string $role, int $orderId): ?Order
    {
        $order = Order::find($orderId);
        if (! $order) {
            return null;
        }
        $uid = (int) $user->id;

        $owns = match ($role) {
            'buyer'   => (int) $order->buyer_id === $uid,
            'rider'   => DeliveryJob::where('order_id', $order->id)->where('rider_user_id', $uid)->exists(),
            'courier' => (int) $order->assigned_courier_id === $uid
                || ShipmentAssignment::where('order_id', $order->id)->where('courier_id', $uid)
                    ->where('assignment_status', 'accepted')->exists(),
            default   => false,
        };

        return $owns ? $order : null;
    }

    /** @return array{error: ?string, report: ?ParcelReport} */
    public static function submit(User $user, string $role, Order $order, array $validated): array
    {
        if ($role === 'buyer' && ! in_array($order->status, self::BUYER_STATUSES, true)) {
            return ['error' => self::ERR_NOT_YET, 'report' => null];
        }
        if ($role !== 'buyer' && in_array($order->status, ['pending', 'cancelled'], true)) {
            return ['error' => self::ERR_NOT_YET, 'report' => null];
        }

        $active = ParcelReport::where('order_id', $order->id)->where('reporter_id', $user->id)
            ->whereIn('status', self::ACTIVE)->lockForUpdate()->exists();
        if ($active) {
            return ['error' => self::ERR_DUPLICATE, 'report' => null];
        }

        $report = ParcelReport::create([
            'order_id'      => $order->id,
            'reporter_id'   => $user->id,
            'reporter_role' => $role,
            'reason'        => $validated['reason'],
            'description'   => trim((string) $validated['description']),
            'status'        => 'open',
        ]);

        return ['error' => null, 'report' => $report];
    }

    /** Admin decision. Same status again = no-op (no second notification). @return array{error: ?string, changed: bool} */
    public static function decide(ParcelReport $report, string $status, ?string $note): array
    {
        $from = $report->status;
        if ($status === $from) {
            if ($note !== null && $note !== '') {
                $report->forceFill(['admin_note' => $note])->save();
            }
            return ['error' => null, 'changed' => false];
        }
        $allowed = ['open' => ['reviewed', 'resolved'], 'reviewed' => ['resolved'], 'resolved' => []];
        if (! in_array($status, $allowed[$from] ?? [], true)) {
            return ['error' => self::ERR_TRANSITION, 'changed' => false];
        }

        $report->forceFill([
            'status'      => $status,
            'admin_note'  => ($note !== null && $note !== '') ? $note : $report->admin_note,
            'reviewed_at' => $report->reviewed_at ?? now(),
            'resolved_at' => $status === 'resolved' ? now() : $report->resolved_at,
        ])->save();

        self::notifyReporter($report);

        return ['error' => null, 'changed' => true];
    }

    public static function notifyReporter(ParcelReport $report): void
    {
        $user = User::find($report->reporter_id);
        if (! $user) {
            return;
        }
        $num  = BuyerNotificationService::orderNumber((int) $report->order_id);
        $what = strtolower(self::REASONS[$report->reason] ?? 'parcel problem');
        [$title, $body] = $report->status === 'resolved'
            ? ['Parcel report resolved', "Your report about a {$what} on order {$num} has been resolved. Thank you for letting us know."]
            : ['Parcel report under review', "Our team is reviewing your report about a {$what} on order {$num}."];

        $url = match ($report->reporter_role) {
            'buyer'   => '/orders/' . $report->order_id,
            'courier' => '/courier/dashboard',
            default   => '',
        };

        UserNotifier::send($user, self::NOTIFY_TYPE, $title, $body, "parcel_report:{$report->id}:{$report->status}",
            ['parcel_report_id' => $report->id, 'order_id' => $report->order_id, 'status' => $report->status], $url, (int) $report->order_id);
    }

    /** Reporter-facing shape (no admin note, no other people's data). */
    public static function present(?ParcelReport $r): ?array
    {
        if (! $r) {
            return null;
        }

        return [
            'id'           => $r->id,
            'order_id'     => $r->order_id,
            'order_number' => BuyerNotificationService::orderNumber((int) $r->order_id),
            'reason'       => $r->reason,
            'reason_label' => self::REASONS[$r->reason] ?? $r->reason,
            'description'  => $r->description,
            'status'       => $r->status,
            'created_at'   => $r->created_at?->toISOString(),
            'reviewed_at'  => $r->reviewed_at?->toISOString(),
            'resolved_at'  => $r->resolved_at?->toISOString(),
        ];
    }
}
