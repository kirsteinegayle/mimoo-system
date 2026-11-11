import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { csrfHeaders } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Buyer web: returns/refunds + reviews UI. Calls the session routes that use
// the SAME controllers and rules as the buyer mobile app:
//   POST /buyer/orders/{id}/return                       (BuyerReturnController@store)
//   POST /buyer/orders/{orderId}/items/{itemId}/review   (BuyerReviewController@store)
//   PUT  /buyer/reviews/{id}  (sent as POST + _method=PUT for multipart)
// ---------------------------------------------------------------------------

export const RETURN_DESC_MIN = 10;
export const RETURN_DESC_MAX = 500;
export const REVIEW_COMMENT_MAX = 500;
export const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function postForm(url: string, form: FormData): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
    credentials: "same-origin",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

/** First Laravel validation message, or a friendly fallback. */
export function errorText(status: number, json: any, fallback: string): string {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status === 419) return "Your session expired. Please refresh the page and try again.";
  const errs = json?.errors;
  if (errs && typeof errs === "object") {
    const first = Object.values(errs)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  if (typeof json?.message === "string" && json.message) return json.message;
  return fallback;
}

// ── Status badge ────────────────────────────────────────────────────────────

const RETURN_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Return requested", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  approved: { label: "Return approved", cls: "bg-blue-50 text-blue-800 border-blue-200" },
  rejected: { label: "Return rejected", cls: "bg-red-50 text-red-700 border-red-200" },
  escalated: { label: "Return escalated", cls: "bg-purple-50 text-purple-800 border-purple-200" },
  refunded: { label: "Refunded", cls: "bg-green-50 text-green-800 border-green-200" },
  closed: { label: "Return closed", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function returnStatusInfo(status: string | null | undefined) {
  return RETURN_STATUS[status ?? ""] ?? { label: `Return ${status ?? ""}`.trim(), cls: "bg-gray-100 text-gray-700 border-gray-200" };
}

export function ReturnStatusBadge({ status }: { status: string }) {
  const s = returnStatusInfo(status);
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

// ── Stars ───────────────────────────────────────────────────────────────────

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} />
      ))}
    </span>
  );
}

// ── Modal shell ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, busy, children }: { title: string; onClose: () => void; busy: boolean; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-50" aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Photo picker ────────────────────────────────────────────────────────────

function PhotoPicker({ files, setFiles, required, disabled, onError }: {
  files: File[];
  setFiles: (f: File[]) => void;
  required: boolean;
  disabled: boolean;
  onError: (msg: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!["image/jpeg", "image/png"].includes(f.type)) {
        onError("Only JPG and PNG images are accepted.");
        continue;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        onError("Each image must not be larger than 5 MB.");
        continue;
      }
      if (next.length >= MAX_PHOTOS) {
        onError(`You can upload up to ${MAX_PHOTOS} photos only.`);
        break;
      }
      next.push(f);
    }
    setFiles(next);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700">
        Photos {required ? <span className="text-red-500">*</span> : <span className="font-normal text-gray-400">(optional)</span>}
        <span className="ml-1 font-normal text-gray-400">
          {required ? `1–${MAX_PHOTOS}` : `up to ${MAX_PHOTOS}`}, JPG/PNG, max 5 MB each
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={src} className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => setFiles(files.filter((_, j) => j !== i))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => ref.current?.click()}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-400 hover:text-purple-600"
            aria-label="Add photo"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">{files.length}/{MAX_PHOTOS}</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => add(e.target.files)} />
    </div>
  );
}

// ── Return request modal ────────────────────────────────────────────────────

export function ReturnRequestModal({ orderId, orderNumber, reasons, onClose, onDone }: {
  orderId: number;
  orderNumber: string;
  reasons: string[];
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desc = description.trim();
  const canSubmit = !busy && !!reason && desc.length >= RETURN_DESC_MIN && desc.length <= RETURN_DESC_MAX && files.length >= 1;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!reason) return setError("Please select a reason.");
    if (desc.length < RETURN_DESC_MIN) return setError(`Description must be at least ${RETURN_DESC_MIN} characters.`);
    if (files.length < 1) return setError("Please add at least 1 photo.");
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("reason", reason);
      form.append("description", desc);
      files.forEach((f) => form.append("images[]", f));
      const { ok, status, json } = await postForm(`/buyer/orders/${orderId}/return`, form);
      if (!ok) throw new Error(errorText(status, json, "Could not submit your return request. Please try again."));
      onDone(json?.message || "Return request submitted.");
    } catch (err: any) {
      setError(err?.message || "Could not submit your return request. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title="Request return / refund" onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-500">Order {orderNumber}. Returns can be requested within 7 days after the order is shipped or completed.</p>
        <div>
          <label htmlFor="rr-reason" className="mb-1.5 block text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            id="rr-reason"
            value={reason}
            disabled={busy}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Select a reason</option>
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rr-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
            Describe the problem <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rr-desc"
            rows={4}
            value={description}
            disabled={busy}
            maxLength={RETURN_DESC_MAX}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the seller what is wrong (at least 10 characters)"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{description.length}/{RETURN_DESC_MAX}</p>
        </div>
        <PhotoPicker files={files} setFiles={setFiles} required disabled={busy} onError={setError} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Review modal (create or edit) ───────────────────────────────────────────

export type ReviewTarget =
  | { mode: "create"; orderId: number; itemId: number; productName: string }
  | { mode: "edit"; reviewId: number; productName: string; rating: number; comment: string | null };

export function ReviewModal({ target, onClose, onDone }: { target: ReviewTarget; onClose: () => void; onDone: (message: string) => void }) {
  const [rating, setRating] = useState(target.mode === "edit" ? target.rating : 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(target.mode === "edit" ? target.comment ?? "" : "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Please select a star rating.");
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("rating", String(rating));
      if (comment.trim()) form.append("comment", comment.trim());
      files.forEach((f) => form.append("images[]", f));
      let url: string;
      if (target.mode === "create") {
        url = `/buyer/orders/${target.orderId}/items/${target.itemId}/review`;
      } else {
        url = `/buyer/reviews/${target.reviewId}`;
        form.append("_method", "PUT");
      }
      const { ok, status, json } = await postForm(url, form);
      if (!ok) throw new Error(errorText(status, json, "Could not save your review. Please try again."));
      onDone(json?.message || "Review saved.");
    } catch (err: any) {
      setError(err?.message || "Could not save your review. Please try again.");
      setBusy(false);
    }
  }

  const shown = hover || rating;

  return (
    <Modal title={target.mode === "create" ? "Write a review" : "Edit your review"} onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="space-y-4">
        <p className="truncate text-sm text-gray-500">{target.productName}</p>
        {target.mode === "edit" && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">You can edit a review only once. New photos replace the old ones; leave photos empty to keep them.</p>
        )}
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">
            Rating <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                disabled={busy}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star className={`h-8 w-8 ${i <= shown ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="rv-comment" className="mb-1.5 block text-sm font-medium text-gray-700">
            Comment <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="rv-comment"
            rows={4}
            value={comment}
            disabled={busy}
            maxLength={REVIEW_COMMENT_MAX}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you liked or didn't like"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/{REVIEW_COMMENT_MAX}</p>
        </div>
        <PhotoPicker files={files} setFiles={setFiles} required={false} disabled={busy} onError={setError} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={busy || rating < 1} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {target.mode === "create" ? "Submit review" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
