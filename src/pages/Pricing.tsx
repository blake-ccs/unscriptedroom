import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { isAuthed } from "../lib/auth";
import { getActiveTeamId, setPendingPurchase } from "../lib/flow";

// ────────────────────────────────────────────────────────────────────────────────
// Display helpers (purely visual). You can wire these to env values later.
// Provide optional display prices via env, e.g. VITE_PRICE_TEAM_CHEMISTRY_MONTH=29
// ────────────────────────────────────────────────────────────────────────────────
function envPrice(key: string, fallback: string) {
  const v = import.meta.env[key] as string | undefined;
  return v && v.trim() ? v : fallback;
}

type Billing = "monthly" | "annual";
const formatPrice = (amount: string, cadence: Billing) =>
  cadence === "annual" ? `${amount} /yr` : `${amount} /mo`;

const PRICES = [
  {
    key: "team_chemistry",
    env: "PRICE_TEAM_CHEMISTRY",
    label: "Team Chemistry",
    highlight: true,
    blurb: "Multiplayer scenarios that sharpen communication and trust.",
    icon: "🧩",
    features: [
      "Lobby & voice via LiveKit",
      "8+ replayable missions",
      "Conversation capture (game + debrief)",
      "Curiosity Coins & leaderboards",
      "Team insights dashboard",
    ],
    monthlyDisplay: () => formatPrice(`$${envPrice("VITE_PRICE_TEAM_CHEMISTRY_MONTH", "29")}`, "monthly"),
    annualDisplay: () =>
      formatPrice(`$${envPrice("VITE_PRICE_TEAM_CHEMISTRY_ANNUAL", "290")}`, "annual"),
  },
  {
    key: "personal_performance",
    env: "PRICE_PERSONAL_PERFORMANCE",
    label: "Personal Performance",
    highlight: false,
    blurb: "Habits, micro-reflections, and focus sprints to build momentum.",
    icon: "⭐",
    features: [
      "Daily check-ins & streaks",
      "Focus sprint timer",
      "Micro-wins → Coins",
      "Simple personal analytics",
      "Email reminders",
    ],
    monthlyDisplay: () => formatPrice(`$${envPrice("VITE_PRICE_PERSONAL_PERFORMANCE_MONTH", "12")}`, "monthly"),
    annualDisplay: () =>
      formatPrice(`$${envPrice("VITE_PRICE_PERSONAL_PERFORMANCE_ANNUAL", "120")}`, "annual"),
  },
  {
    key: "live_training",
    env: "PRICE_LIVE_TRAINING",
    label: "Live Training",
    highlight: false,
    blurb: "Guided team sessions with a facilitator to accelerate outcomes.",
    icon: "🎤",
    features: [
      "60–90 min live workshop",
      "Custom scenario design",
      "Actionable playbooks",
      "Team score & debrief",
      "Priority support",
    ],
    monthlyDisplay: () => formatPrice(`$${envPrice("VITE_PRICE_LIVE_TRAINING_MONTH", "—")}`, "monthly"),
    annualDisplay: () =>
      formatPrice(`$${envPrice("VITE_PRICE_LIVE_TRAINING_ANNUAL", "—")}`, "annual"),
  },
] as const;

// ────────────────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const nav = useNavigate();

  const saveBadgeText = useMemo(() => {
    // purely visual: show a “save 2 months” style badge on annual
    return billing === "annual" ? "save 2 months" : undefined;
  }, [billing]);

  async function checkout(priceEnvKey: string) {
    setLoading(priceEnvKey);
    try {
      // Not authed? Go register, then Start wizard
      if (!isAuthed()) {
        setPendingPurchase([priceEnvKey]);
        nav("/register?next=/start");
        return;
      }

      // Authed but no team? Push to start
      const teamId = getActiveTeamId();
      if (!teamId) {
        setPendingPurchase([priceEnvKey]);
        nav("/start");
        return;
      }

      // Ready to checkout now
      const priceId = import.meta.env[`VITE_${priceEnvKey}`] as string | undefined;
      const payload = priceId ? { team_id: teamId, price_id: priceId } : { team_id: teamId };
      const { data } = await api.post("/checkout/session", payload);
      window.location.href = data.url;
    } catch (e) {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mx-auto mt-3 max-w-2xl text-mute">
          Start with a free trial. Upgrade anytime. Cancel whenever.
        </p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              billing === "monthly" ? "bg-brand-600 text-white shadow" : "text-ink hover:bg-gray-100"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              billing === "annual" ? "bg-brand-600 text-white shadow" : "text-ink hover:bg-gray-100"
            }`}
          >
            Annual {saveBadgeText && <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{saveBadgeText}</span>}
          </button>
        </div>
      </header>

      {/* Plans */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PRICES.map((p) => {
          const isPopular = p.highlight;
          const amount = billing === "annual" ? p.annualDisplay() : p.monthlyDisplay();

          return (
            <div
              key={p.key}
              className={`relative rounded-3xl border p-6 transition-shadow ${
                isPopular
                  ? "border-brand-200 bg-gradient-to-b from-brand-50/70 to-white shadow-[0_10px_40px_-15px_rgba(43,135,255,0.35)]"
                  : "border-gray-200 bg-white shadow-soft"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
                  Most popular
                </div>
              )}

              <div className="text-3xl">{p.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{p.label}</h3>
              <p className="mt-1 text-sm text-mute">{p.blurb}</p>

              <div className="mt-5 flex items-baseline gap-2">
                <div className="text-3xl font-extrabold">{amount}</div>
                {billing === "annual" && <div className="text-xs text-mute">billed annually</div>}
              </div>

              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`btn btn-primary mt-6 w-full ${loading === p.env ? "opacity-90" : ""}`}
                onClick={() => checkout(p.env)}
                disabled={loading === p.env}
              >
                {loading === p.env ? "Redirecting…" : isPopular ? "Start free trial" : "Choose plan"}
              </button>

              <div className="mt-3 text-center text-xs text-mute">
                No commitments. Cancel anytime in the Billing Portal.
              </div>
            </div>
          );
        })}
      </div>

      {/* Guarantee / Contact strip */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-soft">
        <div className="text-sm">
          <span className="mr-2">🛡️</span>
          <strong>30-day guarantee.</strong> If it’s not a fit, we’ll make it right.
          <span className="mx-2">•</span>
          Questions? <a className="link" href="/contact">Talk to us</a>.
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Faq
          q="Can we try Team Chemistry before buying?"
          a="Yes—click “Start free trial” to create a team and access a limited mission set. Upgrade anytime."
        />
        <Faq
          q="How does billing work for teams?"
          a="Subscriptions are tied to your team. You can manage seats and billing details in the Stripe Billing Portal."
        />
        <Faq
          q="What’s included in Live Training?"
          a="A facilitated session tailored to your goals, plus a debrief and concrete playbook to apply next day."
        />
        <Faq
          q="Do you offer discounts for education or non-profits?"
          a="Yes. Contact us and we’ll set up a plan that fits your org."
        />
      </div>
    </section>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft transition hover:shadow-md">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold">{q}</span>
        <span className={`ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && <p className="mt-2 text-sm text-mute">{a}</p>}
    </div>
  );
}
