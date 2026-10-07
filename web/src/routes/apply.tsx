import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { seasonTwo, INTEREST_OPEN_OPTION, INTEREST_FUTURE_OPTION } from "@/lib/site-data";
import { postJson } from "@/lib/api";
import { getUtm } from "@/lib/attribution";
import { Honeypot } from "@/components/site/honeypot";

const searchSchema = z.object({ conversation: z.string().max(160).optional() });

export const Route = createFileRoute("/apply")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Join a Conversation | The Unscripted Room" },
      {
        name: "description",
        content:
          "Tell us a little about yourself if there's a conversation you'd like to be part of at The Unscripted Room.",
      },
      { property: "og:title", content: "Join a Conversation | The Unscripted Room" },
      {
        property: "og:description",
        content:
          "You don't need to be an expert or have a polished story. Raise your hand and tell us why.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplyPage,
});

type FormData = {
  first: string;
  last: string;
  email: string;
  town: string;
  state: string;
  phone: string;
  why: string;
  perspective: string;
  conversation: string;
  anythingElse: string;
};
const empty: FormData = {
  first: "",
  last: "",
  email: "",
  town: "",
  state: "",
  phone: "",
  why: "",
  perspective: "",
  conversation: "",
  anythingElse: "",
};

function ApplyPage() {
  const { conversation } = Route.useSearch();
  // The page is prerendered without a query string, so start empty (matching the static HTML)
  // and apply ?conversation= after hydration — otherwise the <select> shows blank.
  const [data, setData] = React.useState<FormData>(empty);
  React.useEffect(() => {
    const valid =
      conversation &&
      (seasonTwo.some((item) => item.title === conversation) ||
        conversation === INTEREST_OPEN_OPTION ||
        conversation === INTEREST_FUTURE_OPTION);
    if (valid) setData((current) => ({ ...current, conversation: conversation! }));
  }, [conversation]);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [trap, setTrap] = React.useState("");
  const update = (key: keyof FormData, value: string) =>
    setData((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!data.first.trim()) next.first = "First name is required.";
    if (!data.last.trim()) next.last = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) next.email = "Enter a valid email address.";
    if (!data.town.trim()) next.town = "Town or city is required.";
    if (!data.state.trim()) next.state = "State is required.";
    if (!data.why.trim()) next.why = "A sentence or two is plenty.";
    if (!data.perspective.trim()) next.perspective = "A sentence or two is plenty.";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (sending) return;
    if (trap) {
      setDone(true);
      return;
    }
    setSending(true);
    setSendError(null);
    const result = await postJson("/api/lead", {
      email: data.email.trim().toLowerCase(),
      firstName: data.first.trim(),
      lastName: data.last.trim(),
      phone: data.phone.trim(),
      offer: "podcast-guest",
      source: "web",
      city: data.town.trim(),
      stateProvince: data.state.trim(),
      reasonsForSignup: data.why.trim(),
      reasonsForJoining: data.conversation,
      bioAboutMe: [
        "Application Type: Join a Conversation (website)",
        `Conversation Interest: ${data.conversation || "Not specified"}`,
        `Town/State: ${data.town.trim()}, ${data.state.trim()}`,
        `Phone Number: ${data.phone.trim() || "Not provided"}`,
        `Why interested: ${data.why.trim()}`,
        `Perspective/experience: ${data.perspective.trim()}`,
        `Anything else: ${data.anythingElse.trim() || "—"}`,
      ].join("\n"),
      ...getUtm(),
    });
    setSending(false);
    if (result.ok) setDone(true);
    else
      setSendError(
        "Something went wrong on our end. Please try again, or reach us through the contact page.",
      );
  }

  if (done)
    return (
      <section className="paper-texture groove-light section-pad min-h-[70svh]">
        <div className="site-container max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-purple" />
          <p className="eyebrow mt-5">Interest received</p>
          <h1 className="mt-5">Thanks for raising your hand.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We'll take a look and reach out by email if there may be a conversation that's a good
            fit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/watch">Watch a conversation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/join-a-conversation">What taking part is like</Link>
            </Button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="paper-texture groove-light section-pad">
      <div className="site-container grid gap-12 lg:grid-cols-[.55fr_1fr]">
        <div>
          <p className="eyebrow">Send my interest</p>
          <h1 className="mt-5">Join a conversation.</h1>
          <p className="mt-6 text-muted-foreground">
            You don't need to be an expert or have a polished story. If there's a conversation you'd
            like to be part of, tell us a little about yourself.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            Adults age 21+ are welcome. Participation is free. This is a first hello, not an
            application you have to get right.
          </p>
        </div>
        <form
          onSubmit={submit}
          noValidate
          className="paper-card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-9"
        >
          <Honeypot value={trap} onChange={setTrap} />
          <Field label="First name" error={errors["first"]}>
            <Input
              value={data.first}
              onChange={(e) => update("first", e.target.value)}
              maxLength={60}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last name" error={errors["last"]}>
            <Input
              value={data.last}
              onChange={(e) => update("last", e.target.value)}
              maxLength={60}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Email" error={errors["email"]}>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              maxLength={255}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone (optional)">
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              maxLength={30}
              autoComplete="tel"
            />
          </Field>
          <Field label="Town / city" error={errors["town"]}>
            <Input
              value={data.town}
              onChange={(e) => update("town", e.target.value)}
              maxLength={100}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" error={errors["state"]}>
            <Input
              value={data.state}
              onChange={(e) => update("state", e.target.value)}
              maxLength={60}
              autoComplete="address-level1"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="What made you interested in joining a conversation?"
              error={errors["why"]}
            >
              <Textarea
                value={data.why}
                onChange={(e) => update("why", e.target.value)}
                maxLength={1200}
                className="min-h-24"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="What perspective or experience would you bring to the table?"
              error={errors["perspective"]}
            >
              <Textarea
                value={data.perspective}
                onChange={(e) => update("perspective", e.target.value)}
                maxLength={1200}
                className="min-h-24"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="form-label">
                Is there a conversation you're especially interested in? (optional)
              </span>
              <select
                value={data.conversation}
                onChange={(e) => update("conversation", e.target.value)}
                className="h-10 w-full border border-input bg-transparent px-3 text-sm focus-visible:border-chartreuse focus-visible:outline-none"
              >
                <option value="">Choose one — or leave blank</option>
                {seasonTwo.map((item) => (
                  <option key={item.n} value={item.title}>
                    {String(item.n).padStart(2, "0")} · {item.title}
                  </option>
                ))}
                <option value={INTEREST_OPEN_OPTION}>{INTEREST_OPEN_OPTION}</option>
                <option value={INTEREST_FUTURE_OPTION}>{INTEREST_FUTURE_OPTION}</option>
              </select>
            </label>
          </div>
          <div className="sm:col-span-2">
            <Field label="Anything else you'd like us to know? (optional)">
              <Textarea
                value={data.anythingElse}
                onChange={(e) => update("anythingElse", e.target.value)}
                maxLength={1200}
                className="min-h-20"
              />
            </Field>
          </div>
          {sendError && (
            <p className="field-error sm:col-span-2" role="alert">
              {sendError}
            </p>
          )}
          <Button
            type="submit"
            variant="apply"
            size="lg"
            disabled={sending}
            className="sm:col-span-2"
          >
            {sending ? (
              "Sending…"
            ) : (
              <>
                Send my interest <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
