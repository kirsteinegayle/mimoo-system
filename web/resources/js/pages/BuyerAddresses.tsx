import { confirmDialog } from '@/components/app-modal';
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Loader2, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { fetchBarangays, fetchCitiesByProvince, fetchCitiesByRegion, fetchProvinces, fetchRegions } from "@/services/psgcApi";

// ---------------------------------------------------------------------------
// Buyer address book (web). Same BuyerAddressController, validation and
// invariants as the buyer app (max 10, exactly one default, default can't be
// deleted) through the session routes /buyer/addresses*.
// ---------------------------------------------------------------------------

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  region: string;
  province: string | null;
  district: string | null;
  municipality_city: string;
  barangay: string;
  street_address: string;
  postal_code: string | null;
  is_default: boolean;
  full_address: string;
}

type Form = Omit<Address, "id" | "is_default" | "full_address">;
type Opt = { name: string; code: string };

const EMPTY: Form = {
  label: "Home",
  recipient_name: "",
  phone: "",
  region: "",
  province: "",
  district: "",
  municipality_city: "",
  barangay: "",
  street_address: "",
  postal_code: "",
};

const NCR = "National Capital Region (NCR)";
const FIELD =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4B2E7E] focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20 disabled:bg-gray-50";

async function api(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(method === "GET" ? {} : { "Content-Type": "application/json", ...csrfHeaders() }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function AddressForm({ initial, editingId, onClose, onSaved }: { initial: Form; editingId: number | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Opt[]>([]);
  const [provinces, setProvinces] = useState<Opt[]>([]);
  const [cities, setCities] = useState<Opt[]>([]);
  const [barangays, setBarangays] = useState<Opt[]>([]);
  const isNCR = f.region === NCR;
  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetchRegions().then((r) => setRegions(r.data));
  }, []);

  useEffect(() => {
    const reg = regions.find((r) => r.name === f.region);
    setProvinces([]);
    setCities([]);
    if (!reg) return;
    if (isNCR) fetchCitiesByRegion([reg.code]).then((r) => setCities(r.data));
    else fetchProvinces([reg.code]).then((r) => setProvinces(r.data));
  }, [f.region, regions, isNCR]);

  useEffect(() => {
    if (isNCR) return;
    const prov = provinces.find((p) => p.name === f.province);
    setCities([]);
    if (prov) fetchCitiesByProvince([prov.code]).then((r) => setCities(r.data));
  }, [f.province, provinces, isNCR]);

  useEffect(() => {
    const city = cities.find((c) => c.name === f.municipality_city);
    setBarangays([]);
    if (city) fetchBarangays([city.code]).then((r) => setBarangays(r.data));
  }, [f.municipality_city, cities]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = { ...f, province: isNCR ? null : f.province || null, district: f.district || null, postal_code: f.postal_code || null };
    const { ok, json } = await api(editingId ? `/buyer/addresses/${editingId}` : "/buyer/addresses", editingId ? "PUT" : "POST", payload);
    setSaving(false);
    if (!ok) {
      const errs: Record<string, string> = {};
      Object.entries(json?.errors ?? {}).forEach(([k, v]) => (errs[k] = Array.isArray(v) ? String(v[0]) : String(v)));
      setErrors(errs);
      toast.error(json?.message || "Please check the form.");
      return;
    }
    toast.success(editingId ? "Address updated." : "Address added.");
    onSaved();
  }

  const err = (k: string) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null);
  // Keep current values selectable while the PSGC lists load (edit mode).
  const withCurrent = (opts: Opt[], value: string | null) => (value && !opts.some((o) => o.name === value) ? [{ name: value, code: `cur-${value}` }, ...opts] : opts);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 text-gray-900 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{editingId ? "Edit address" : "New address"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Label</label>
            <div className="flex flex-wrap gap-2">
              {["Home", "Work", "Other"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => set("label", l)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${f.label === l ? "bg-[#4B2E7E] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {err("label")}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Recipient name</label>
            <input className={FIELD} value={f.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} maxLength={255} />
            {err("recipient_name")}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Mobile number</label>
            <input className={FIELD} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09XXXXXXXXX" maxLength={20} />
            {err("phone")}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Region</label>
            <select className={FIELD} value={f.region} onChange={(e) => setF((p) => ({ ...p, region: e.target.value, province: "", municipality_city: "", barangay: "" }))}>
              <option value="">Select region</option>
              {withCurrent(regions, f.region).map((r) => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
            {err("region")}
          </div>
          {!isNCR && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Province</label>
              <select className={FIELD} value={f.province ?? ""} disabled={!f.region} onChange={(e) => setF((p) => ({ ...p, province: e.target.value, municipality_city: "", barangay: "" }))}>
                <option value="">Select province</option>
                {withCurrent(provinces, f.province).map((r) => (
                  <option key={r.code} value={r.name}>{r.name}</option>
                ))}
              </select>
              {err("province")}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">City / Municipality</label>
            <select className={FIELD} value={f.municipality_city} disabled={isNCR ? !f.region : !f.province} onChange={(e) => setF((p) => ({ ...p, municipality_city: e.target.value, barangay: "" }))}>
              <option value="">Select city</option>
              {withCurrent(cities, f.municipality_city).map((r) => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
            {err("municipality_city")}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Barangay</label>
            <select className={FIELD} value={f.barangay} disabled={!f.municipality_city} onChange={(e) => set("barangay", e.target.value)}>
              <option value="">Select barangay</option>
              {withCurrent(barangays, f.barangay).map((r) => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
            {err("barangay")}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Street, building, house no.</label>
            <input className={FIELD} value={f.street_address} onChange={(e) => set("street_address", e.target.value)} maxLength={255} />
            {err("street_address")}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Postal code (optional)</label>
            <input className={FIELD} value={f.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
            {err("postal_code")}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B] disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save address
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BuyerAddresses() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const [rows, setRows] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number | null; form: Form } | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { ok, json } = await api("/buyer/addresses");
    if (ok) setRows(json.data ?? []);
    else toast.error(json?.message || "Could not load your addresses.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function makeDefault(a: Address) {
    setBusy(a.id);
    const { ok, json } = await api(`/buyer/addresses/${a.id}/default`, "POST", {});
    setBusy(null);
    if (!ok) return toast.error(json?.message || "Could not set the default address.");
    toast.success("Default address updated.");
    load();
  }

  async function remove(a: Address) {
    if (!(await confirmDialog(`Delete the "${a.label}" address?`))) return;
    setBusy(a.id);
    const { ok, json } = await api(`/buyer/addresses/${a.id}`, "DELETE");
    setBusy(null);
    if (!ok) return toast.error(json?.message || "Could not delete the address.");
    toast.success("Address deleted.");
    load();
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8]">
      <Head title="My Addresses" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Account
        </Link>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#2A1B4D]">My Addresses</h1>
            <p className="text-sm text-[#6E6570]">Saved delivery addresses · up to 10</p>
          </div>
          <button
            type="button"
            disabled={rows.length >= 10}
            onClick={() => setEditing({ id: null, form: { ...EMPTY, recipient_name: auth?.user?.name ?? "" } })}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add address
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9CFEA] bg-white p-10 text-center">
            <MapPin className="mx-auto mb-2 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-800">No saved addresses yet</p>
            <p className="mt-1 text-sm text-gray-500">Add one to check out faster.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((a) => (
              <li key={a.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${a.is_default ? "border-[#4B2E7E]" : "border-gray-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F4F0FA] px-2 py-0.5 text-xs font-bold text-[#4B2E7E]">{a.label}</span>
                      {a.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4B2E7E] px-2 py-0.5 text-xs font-bold text-white">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">
                      {a.recipient_name} <span className="font-normal text-gray-500">· {a.phone}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">{a.full_address}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() =>
                        setEditing({
                          id: a.id,
                          form: {
                            label: a.label,
                            recipient_name: a.recipient_name,
                            phone: a.phone,
                            region: a.region,
                            province: a.province ?? "",
                            district: a.district ?? "",
                            municipality_city: a.municipality_city,
                            barangay: a.barangay,
                            street_address: a.street_address,
                            postal_code: a.postal_code ?? "",
                          },
                        })
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {!a.is_default && (
                      <button type="button" aria-label="Delete" disabled={busy === a.id} onClick={() => remove(a)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {!a.is_default && (
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() => makeDefault(a)}
                    className="mt-3 text-xs font-semibold text-[#4B2E7E] hover:underline disabled:opacity-50"
                  >
                    Set as default
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {editing && (
        <AddressForm
          initial={editing.form}
          editingId={editing.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
