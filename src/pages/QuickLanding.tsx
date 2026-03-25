import { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../lib/apiBase";

const logoUrl = new URL("../assets/LogoUSR.png", import.meta.url).href;

export default function QuickLanding() {
  const [step, setStep] = useState<"choice" | "form" | "done">("choice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch(`${API_BASE}/api/qr/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, stage: "captured" }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      window.location.href = "/";
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-12 text-left">
        <img src={logoUrl} alt="The Unscripted Room logo" className="mb-8 h-24 w-auto" />

        <div className="w-full max-w-2xl space-y-6">
          <div className="rounded-2xl bg-[#f4ece1] px-6 py-5 text-sm text-black/80 text-left">
            <p>You&apos;ve found one of our purple envelopes.</p>
            <p className="mt-3">
              They&apos;re placed intentionally throughout the community as a quiet invitation to move past small talk
              and into something real.
            </p>
            <p className="mt-3">
              The Unscripted Room is a facilitated group conversation built around nine thoughtful questions, equal
              voices, and real conversation.
            </p>
            <p className="mt-3">Curiosity brought you here.</p>
          </div>

          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-[#7A3168] text-left shadow-[0_6px_14px_rgba(122,49,104,0.22)]">
            Are you curious enough to take a seat in the room?
          </div>

          <div className="rounded-2xl bg-[#f4ece1] px-6 py-4 text-sm font-semibold text-black/80 text-left">
            What would you like to do next?
          </div>

          {step === "choice" ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                to="/contact-us"
                className="rounded-full bg-[#6b2a5e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Reserve a Seat
              </Link>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="rounded-full border border-[#6b2a5e] bg-white px-6 py-3 text-sm font-semibold text-[#6b2a5e] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Learn More
              </button>
            </div>
          ) : step === "form" ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-black/5 blur-3xl" aria-hidden="true" />
              <form
                onSubmit={submit}
                className="relative mt-2 w-full space-y-4 rounded-2xl border border-black/10 bg-white px-6 py-6 text-left shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-black/70">Enter your details</div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("choice");
                      setError("");
                    }}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Back
                  </button>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                  required
                />

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#6b2a5e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Submitting..." : "Continue"}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-green-700">Saved. You can head to the website.</p>
              <a
                href="/"
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Go to website
              </a>
            </div>
          )}

          {status === "error" && (
            <p className="mt-2 text-xs text-red-600">Couldn’t submit. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
