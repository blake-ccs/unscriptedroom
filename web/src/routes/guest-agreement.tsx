import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Printer } from "lucide-react";
import { Honeypot } from "@/components/site/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/api";
import {
  AGREEMENT_TITLE,
  AGREEMENT_VERSION,
  agreementConfirmations,
  agreementSections,
} from "@/lib/guest-agreement";

// Unlisted page where confirmed guests sign the Guest Participation Agreement, one link for everyone:
// /guest-agreement. Kept out of navigation, the sitemap and search.
// Signatures go to the existing POST /api/contact endpoint (server code is not modified): it creates a
// separate ActiveCampaign "Contact Message" record per signature, so a signed agreement is never
// overwritten by later submissions.
export const Route = createFileRoute("/guest-agreement")({
  head: () => ({
    meta: [
      { title: "Guest Participation Agreement | The Unscripted Room" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuestAgreementPage,
});

type ConfirmationId = (typeof agreementConfirmations)[number]["id"];
const noConfirmations = Object.fromEntries(
  agreementConfirmations.map((c) => [c.id, false]),
) as Record<ConfirmationId, boolean>;

type ErrorKey = "fullName" | "email" | "signature" | ConfirmationId;

const normalise = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

function GuestAgreementPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(noConfirmations);
  const [errors, setErrors] = React.useState<Partial<Record<ErrorKey, string>>>({});
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [signedAt, setSignedAt] = React.useState<Date | null>(null);
  const [trap, setTrap] = React.useState("");

  const today = new Date().toLocaleDateString("en-US", { dateStyle: "long" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<ErrorKey, string>> = {};
    if (!fullName.trim()) next.fullName = "Your full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    for (const c of agreementConfirmations)
      if (!confirmed[c.id]) next[c.id] = "Please confirm to continue.";
    if (!signature.trim()) next.signature = "Type your full name to sign.";
    else if (fullName.trim() && normalise(signature) !== normalise(fullName))
      next.signature = "Your signature should match the full name you entered above.";
    setErrors(next);
    if (Object.keys(next).length) {
      setSendError("A few items still need your attention.");
      return;
    }
    if (sending) return;
    const now = new Date();
    if (trap) {
      setSignedAt(now);
      return;
    }
    setSending(true);
    setSendError(null);
    const message = [
      `GUEST PARTICIPATION AGREEMENT: SIGNED`,
      `Agreement version: ${AGREEMENT_VERSION}`,
      ``,
      `Signature (typed): ${signature.trim()}`,
      `Full name: ${fullName.trim()}`,
      `Email: ${email.trim().toLowerCase()}`,
      `Signed: ${now.toLocaleString("en-US", { dateStyle: "long", timeStyle: "long" })} (${now.toISOString()})`,
      ``,
      ...agreementConfirmations.map((c) => `[x] ${c.label}`),
      ``,
      `Page: ${window.location.origin}${window.location.pathname}`,
      `Browser: ${navigator.userAgent}`,
    ].join("\n");
    const result = await postJson("/api/contact", {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: "Guest Participation Agreement (signed)",
      message,
    });
    setSending(false);
    if (result.ok) {
      setSignedAt(now);
      window.scrollTo({ top: 0 });
    } else {
      setSendError(
        "We couldn't submit your agreement just now. Your entries are still here. Please try again in a moment.",
      );
    }
  }

  if (signedAt)
    return (
      <section className="paper-texture section-pad min-h-[70svh]">
        <div className="site-container max-w-2xl text-center" role="status">
          <CheckCircle2 className="mx-auto h-12 w-12 text-purple" aria-hidden="true" />
          <h1 className="mt-6">Thank you, {fullName.trim().split(" ")[0]}.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Your signed Guest Participation Agreement has been received. We&apos;re looking forward
            to having you join us at The Unscripted Room!
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Signed by {signature.trim()} on{" "}
            {signedAt.toLocaleDateString("en-US", { dateStyle: "long" })}.
          </p>
        </div>
      </section>
    );

  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10 max-w-3xl">
          <p className="rule-label text-chartreuse">The Unscripted Room Podcast</p>
          <h1 className="mt-5 text-warm-white">{AGREEMENT_TITLE}</h1>
          <p className="mt-6 text-lg text-warm-white/75">
            Please read the agreement below, then sign at the bottom of the page.
          </p>
        </div>
      </section>

      <section className="paper-texture section-pad">
        <div className="site-container max-w-3xl">
          <article className="agreement-text space-y-10 text-[1.02rem] leading-relaxed text-foreground/85">
            {agreementSections.map((section, i) => (
              <div key={section.heading ?? i}>
                {section.heading && <h2 className="mb-4 text-2xl">{section.heading}</h2>}
                <div className="space-y-4">
                  {section.blocks.map((block, j) =>
                    block.kind === "p" ? (
                      <p key={j}>{block.text}</p>
                    ) : (
                      <ul key={j} className="list-disc space-y-1.5 pl-6">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Agreement version {AGREEMENT_VERSION}</p>
          </article>

          <form
            onSubmit={submit}
            noValidate
            className="relative mt-14 grid gap-8 border-t border-foreground/25 pt-10 print:hidden"
          >
            <Honeypot value={trap} onChange={setTrap} />
            <h2>Sign the agreement</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName}>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" error={errors.email}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  autoComplete="email"
                />
              </Field>
            </div>

            <fieldset className="grid gap-4">
              <legend className="form-label mb-2">Please confirm</legend>
              {agreementConfirmations.map((c) => (
                <label key={c.id} className="flex items-start gap-3 text-base">
                  <input
                    type="checkbox"
                    checked={confirmed[c.id]}
                    onChange={(e) => setConfirmed((cur) => ({ ...cur, [c.id]: e.target.checked }))}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-purple)]"
                  />
                  <span>
                    {c.label}
                    {errors[c.id] && (
                      <span className="field-error" role="alert">
                        {errors[c.id]}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field
                label="Signature: type your full name"
                hint="Typing your name here is your electronic signature."
                error={errors.signature}
              >
                <Input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  maxLength={120}
                  autoComplete="off"
                  className="h-13 text-lg italic"
                />
              </Field>
              <div className="pb-3 text-sm text-muted-foreground">Date: {today}</div>
            </div>

            <div className="border-t border-foreground/25 pt-8">
              <p className="text-sm text-muted-foreground">
                Your signed agreement is sent securely to The Unscripted Room team and kept with
                your guest record.
              </p>
              {sendError && (
                <p className="field-error mt-4" role="alert">
                  {sendError}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" variant="apply" size="lg" disabled={sending}>
                  {sending ? "Submitting…" : "Sign and submit"}
                </Button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-foreground hover:text-purple"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" /> Print a copy
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {hint && <span className="-mt-1 mb-2 block text-sm text-muted-foreground">{hint}</span>}
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
