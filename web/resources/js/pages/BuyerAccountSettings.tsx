import { useCallback, useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { errorText } from "@/components/buyer/returns-reviews";

// ---------------------------------------------------------------------------
// Buyer web: account settings. Same endpoints, validation, OTP rules and rate
// limits as the mobile app (GET/PUT /buyer/profile, POST /buyer/change-password,
// /buyer/change-email/{request,verify}, /buyer/change-phone/{request,verify}).
// ---------------------------------------------------------------------------

interface Profile {
  first_name: string | null;
  last_name: string | null;
  middle_initial: string | null;
  email: string;
  contact_number: string | null;
  birthday: string | null;
  sex: string | null;
}

type Msg = { text: string; ok: boolean } | null;

async function call(method: string, url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(body === undefined ? {} : { "Content-Type": "application/json", ...csrfHeaders() }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20";
const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50";
const ghostBtnCls =
  "rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      {desc && <p className="mb-4 mt-1 text-sm text-neutral-500">{desc}</p>}
      {!desc && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`} role="status">
      {msg.text}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

// ── Profile info ────────────────────────────────────────────────────────────

function ProfileCard({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const [f, setF] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    middle_initial: profile.middle_initial ?? "",
    sex: profile.sex ?? "",
    birthday: profile.birthday ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { res, json } = await call("PUT", "/buyer/profile", {
        first_name: f.first_name,
        last_name: f.last_name,
        middle_initial: f.middle_initial || null,
        sex: f.sex || null,
        birthday: f.birthday || null,
      });
      if (!res.ok) setMsg({ text: errorText(res.status, json, "Could not save your profile."), ok: false });
      else {
        setMsg({ text: "Profile updated.", ok: true });
        onSaved();
      }
    } catch {
      setMsg({ text: "Could not save your profile. Please check your connection.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Profile information" desc="Your name and personal details.">
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input className={inputCls} value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input className={inputCls} value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} />
          </Field>
          <Field label="Middle initial">
            <input className={inputCls} maxLength={1} value={f.middle_initial} onChange={(e) => setF({ ...f, middle_initial: e.target.value })} />
          </Field>
          <Field label="Gender">
            <select className={inputCls} value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
          <Field label="Birthday">
            <input type="date" className={inputCls} value={f.birthday} onChange={(e) => setF({ ...f, birthday: e.target.value })} />
          </Field>
        </div>
        <button type="submit" disabled={busy} className={btnCls}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
        </button>
        <Note msg={msg} />
      </form>
    </Card>
  );
}

// ── Change email / phone (request code -> verify code) ──────────────────────

function OtpChangeCard(props: {
  title: string;
  desc: string;
  current: string;
  field: "new_email" | "new_phone";
  fieldLabel: string;
  inputType: string;
  placeholder: string;
  base: "/buyer/change-email" | "/buyer/change-phone";
  onDone: () => void;
}) {
  const [step, setStep] = useState<"form" | "code">("form");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function request(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { res, json } = await call("POST", `${props.base}/request`, { [props.field]: value, password });
      if (!res.ok) setMsg({ text: errorText(res.status, json, "Could not send the code."), ok: false });
      else {
        setStep("code");
        setPassword("");
        setMsg({ text: json.message || "A verification code was sent.", ok: true });
      }
    } catch {
      setMsg({ text: "Could not send the code. Please check your connection.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { res, json } = await call("POST", `${props.base}/verify`, { code });
      if (!res.ok) setMsg({ text: errorText(res.status, json, "Could not verify the code."), ok: false });
      else {
        setStep("form");
        setValue("");
        setCode("");
        setMsg({ text: json.message || "Updated.", ok: true });
        props.onDone();
      }
    } catch {
      setMsg({ text: "Could not verify the code. Please check your connection.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title={props.title} desc={props.desc}>
      <p className="mb-4 text-sm text-neutral-600">
        Current: <span className="font-semibold text-neutral-900">{props.current || "Not set"}</span>
      </p>
      {step === "form" ? (
        <form onSubmit={request} className="space-y-4">
          <Field label={props.fieldLabel}>
            <input type={props.inputType} className={inputCls} value={value} placeholder={props.placeholder} onChange={(e) => setValue(e.target.value)} required />
          </Field>
          <Field label="Current password">
            <input type="password" autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <button type="submit" disabled={busy || !value || !password} className={btnCls}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send verification code
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <Field label="6-digit verification code">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`${inputCls} tracking-[0.4em]`}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </Field>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6} className={btnCls}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify and save
            </button>
            <button type="button" disabled={busy} onClick={() => { setStep("form"); setCode(""); setMsg(null); }} className={ghostBtnCls}>
              Start over
            </button>
          </div>
        </form>
      )}
      <Note msg={msg} />
    </Card>
  );
}

// ── Change password ─────────────────────────────────────────────────────────

function PasswordCard() {
  const [f, setF] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { res, json } = await call("POST", "/buyer/change-password", f);
      if (!res.ok) setMsg({ text: errorText(res.status, json, "Could not change your password."), ok: false });
      else {
        setF({ current_password: "", new_password: "", new_password_confirmation: "" });
        setMsg({ text: "Password updated. Your other devices were signed out.", ok: true });
      }
    } catch {
      setMsg({ text: "Could not change your password. Please check your connection.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Change password" desc="Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.">
      <form onSubmit={save} className="space-y-4">
        <Field label="Current password">
          <input type="password" autoComplete="current-password" className={inputCls} value={f.current_password} onChange={(e) => setF({ ...f, current_password: e.target.value })} required />
        </Field>
        <Field label="New password">
          <input type="password" autoComplete="new-password" className={inputCls} value={f.new_password} onChange={(e) => setF({ ...f, new_password: e.target.value })} required />
        </Field>
        <Field label="Confirm new password">
          <input type="password" autoComplete="new-password" className={inputCls} value={f.new_password_confirmation} onChange={(e) => setF({ ...f, new_password_confirmation: e.target.value })} required />
        </Field>
        <button type="submit" disabled={busy || !f.current_password || !f.new_password || !f.new_password_confirmation} className={btnCls}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
        </button>
        <Note msg={msg} />
      </form>
    </Card>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function BuyerAccountSettings() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { res, json } = await call("GET", "/buyer/profile");
      if (!res.ok) throw new Error(errorText(res.status, json, "Could not load your account."));
      setProfile(json.data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not load your account.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Also refresh the shared auth user so the header shows the new email.
  const refresh = () => {
    load();
    router.reload({ only: ['auth'] });
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title="Account Settings - mimoo" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="mx-auto max-w-[760px] space-y-5 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Account Settings</h1>
          <p className="mt-2 text-neutral-600">Manage your profile, email, phone number and password.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
            <button type="button" onClick={load} className="ml-3 font-semibold underline">Try again</button>
          </div>
        ) : !profile ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        ) : (
          <>
            <ProfileCard profile={profile} onSaved={load} />
            <OtpChangeCard
              title="Email address"
              desc="We send a 6-digit code to the new email to confirm it is yours."
              current={profile.email}
              field="new_email"
              fieldLabel="New email"
              inputType="email"
              placeholder="you@example.com"
              base="/buyer/change-email"
              onDone={refresh}
            />
            <OtpChangeCard
              title="Phone number"
              desc="We send a 6-digit code to your current email to confirm the change."
              current={profile.contact_number ?? ""}
              field="new_phone"
              fieldLabel="New mobile number"
              inputType="tel"
              placeholder="09XXXXXXXXX or +639XXXXXXXXX"
              base="/buyer/change-phone"
              onDone={refresh}
            />
            <PasswordCard />
          </>
        )}
      </main>
    </div>
  );
}
