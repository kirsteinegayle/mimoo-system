import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Star, CheckCircle } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { ReviewModal, Stars, type ReviewTarget } from "@/components/buyer/returns-reviews";

// ---------------------------------------------------------------------------
// Buyer web: my reviews. Editing uses the same endpoint and rules as the
// mobile app (once, within 30 days). No delete (not supported by mobile/API).
// ---------------------------------------------------------------------------

interface MyReview {
  id: number;
  product_id: number;
  product_name: string;
  product_url: string | null;
  order_id: number | null;
  rating: number;
  comment: string | null;
  images: string[];
  is_edited: boolean;
  can_edit: boolean;
  seller_reply: string | null;
  created_at: string | null;
}

function date(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function BuyerReviews() {
  const { auth, reviews } = usePage<{ auth: { user: any }; reviews: MyReview[] }>().props;
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne] text-[#2A1B4D]">
      <Head title="My Reviews" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="mb-5 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>My Reviews</h1>
            <p className="text-[0.83rem] text-[#6E6570] mt-1">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          </div>
          <Link href="/orders?status=to_review" className="text-sm font-semibold text-[#4B2E7E] hover:underline">Items to review</Link>
        </div>

        {notice && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="hover:underline">Dismiss</button>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-[14px] bg-white p-12 text-center border border-[rgba(185,166,222,0.18)]">
            <Star className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <p className="text-[0.88rem] text-[#6E6570] mb-4">You haven't written any reviews yet.</p>
            <Link href="/orders?status=to_review" className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition">
              Review your purchases
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-[14px] bg-white p-5 shadow-sm border border-[rgba(185,166,222,0.18)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    {r.product_url ? (
                      <Link href={r.product_url} className="font-bold hover:underline">{r.product_name}</Link>
                    ) : (
                      <span className="font-bold">{r.product_name}</span>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6E6570]">
                      <Stars value={r.rating} />
                      <span>{date(r.created_at)}</span>
                      {r.is_edited && <span>· Edited</span>}
                      {r.order_id && (
                        <Link href={`/orders/${r.order_id}`} className="text-[#4B2E7E] hover:underline">View order</Link>
                      )}
                    </div>
                  </div>
                  {r.can_edit && (
                    <button
                      type="button"
                      onClick={() => setTarget({ mode: "edit", reviewId: r.id, productName: r.product_name, rating: r.rating, comment: r.comment })}
                      className="rounded-lg border-[1.5px] border-[#B9A6DE] px-4 py-1.5 text-sm font-semibold text-[#4B2E7E] hover:bg-[#F9F7FC]"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {r.comment && <p className="mt-3 text-sm whitespace-pre-wrap break-words">{r.comment}</p>}
                {r.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                        <img src={src} alt="Review photo" className="h-16 w-16 rounded-lg object-cover border border-neutral-200" />
                      </a>
                    ))}
                  </div>
                )}
                {r.seller_reply && (
                  <div className="mt-3 rounded-lg bg-[#F9F7FC] border-l-4 border-[#4B2E7E] p-3">
                    <p className="text-xs font-semibold text-[#4B2E7E]">Seller reply</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{r.seller_reply}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {target && (
        <ReviewModal
          target={target}
          onClose={() => setTarget(null)}
          onDone={(msg) => {
            setTarget(null);
            setNotice(msg);
            router.reload({ only: ["reviews"] });
          }}
        />
      )}
    </div>
  );
}
