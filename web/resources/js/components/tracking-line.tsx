/**
 * Small read-only "Tracking" line: friendly status label + message + updated time.
 * Renders nothing when the order has no tracking yet.
 * Styling follows the buyer web tracking box in MyPurchases.tsx.
 */

export interface TrackingFields {
    tracking_status?: string | null;
    tracking_message?: string | null;
    tracking_updated_at?: string | null;
}

const TRACKING_LABELS: Record<string, string> = {
    received_logistics: 'Received by logistics',
    assigned_courier: 'Assigned to courier',
    accepted_courier: 'Accepted by courier',
    scanned_at_facility: 'At sorting facility',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    delivery_failed: 'Delivery attempt failed',
    returning_to_sender: 'Returning to sender',
};

export function trackingLabel(status?: string | null): string | null {
    if (!status) return null;
    return TRACKING_LABELS[status] ?? status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export default function TrackingLine({ tracking, className = '' }: { tracking: TrackingFields; className?: string }) {
    const label = trackingLabel(tracking.tracking_status);
    const message = tracking.tracking_message;
    if (!label && !message) return null;

    return (
        <div className={`flex items-start gap-2 text-[0.82rem] text-[#4B2E7E] bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 ${className}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <div className="min-w-0">
                <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-[#6E6570]">
                    Tracking{label ? ` · ${label}` : ''}
                </div>
                {message && <div className="font-medium break-words">{message}</div>}
                {tracking.tracking_updated_at && (
                    <div className="text-[0.72rem] text-[#6E6570] mt-0.5">Updated {tracking.tracking_updated_at}</div>
                )}
            </div>
        </div>
    );
}
