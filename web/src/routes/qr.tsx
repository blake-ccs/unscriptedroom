import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/api";

// Landing page for the purple-envelope QR codes printed around the community. Keep this URL stable.
export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "You found an envelope | The Unscripted Room" },
      {
        name: "description",
        content: "A quiet invitation to move past small talk and into something real.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [step, setStep] = React.useState<"choice" | "form" | "done">("choice");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Name and a valid email are required.");
      return;
    }
    setError("");
    setSending(true);
    const result = await postJson("/api/qr/lead", {
      name: name.trim(),
      email: email.trim(),
      stage: "captured",
    });
    setSending(false);
    if (result.ok) setStep("done");
    else setError("Couldn’t submit. Please try again.");
  }

  return (
    <section className="dark-band tactile min-h-[80svh] py-16 sm:py-24">
      <div className="site-container relative z-10 max-w-3xl">
        <div className="space-y-5 text-lg text-warm-white/80">
          <p>You&apos;ve found one of our purple envelopes.</p>
          <p>
            They&apos;re placed intentionally throughout the community as a quiet invitation to move
            past small talk and into something real.
          </p>
          <p>
            The Unscripted Room is a facilitated group conversation built around nine thoughtful
            questions, equal voices, and real conversation.
          </p>
          <p>Curiosity brought you here.</p>
        </div>
        <h1 className="mt-10 text-warm-white">
          Are you curious enough to take a seat in the room?
        </h1>

        <div className="mt-10">
          {step === "choice" && (
            <>
              <p className="rule-label text-chartreuse">What would you like to do next?</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="apply" size="lg">
                  <Link to="/apply">Reserve a Seat</Link>
                </Button>
                <Button variant="darkOutline" size="lg" onClick={() => setStep("form")}>
                  Learn More
                </Button>
              </div>
            </>
          )}

          {step === "form" && (
            <form
              onSubmit={submit}
              noValidate
              className="paper-card max-w-xl p-6 text-foreground sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow">Enter your details</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("choice");
                    setError("");
                  }}
                  className="text-xs font-semibold uppercase tracking-[.14em] hover:text-purple"
                >
                  Back
                </button>
              </div>
              <div className="mt-6 grid gap-5">
                <label className="block">
                  <span className="form-label">Full name</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="form-label">Email address</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                  />
                </label>
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" variant="apply" size="lg" disabled={sending}>
                  {sending ? "Submitting…" : "Continue"}
                </Button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="paper-card max-w-xl p-8 text-foreground" role="status">
              <CheckCircle2 className="h-10 w-10 text-purple" />
              <h2 className="mt-5">Saved.</h2>
              <p className="mt-3 text-muted-foreground">
                Thanks! We&apos;ll be in touch. In the meantime, have a look around.
              </p>
              <Button asChild variant="apply" size="lg" className="mt-6">
                <Link to="/">Go to website</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
