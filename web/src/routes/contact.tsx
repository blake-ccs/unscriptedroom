import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/site-ui";
import { Honeypot } from "@/components/site/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | The Unscripted Room" },
      {
        name: "description",
        content:
          "Contact The Unscripted Room about a general question, topic idea, collaboration, or media inquiry.",
      },
      { property: "og:title", content: "Contact The Unscripted Room" },
      {
        property: "og:description",
        content: "Send the team a note about something unrelated to joining a conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const TOPICS = [
  "General question",
  "Suggest a conversation topic",
  "Partnership or collaboration",
  "Media inquiry",
  "Something else",
] as const;

type FormData = { first: string; last: string; email: string; topic: string; message: string };
const empty: FormData = { first: "", last: "", email: "", topic: "", message: "" };

function Page() {
  const [data, setData] = React.useState<FormData>(empty);
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
    if (!data.topic) next.topic = "Choose a topic.";
    if (!data.message.trim()) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length || sending) return;
    if (trap) {
      setDone(true);
      return;
    }
    setSending(true);
    setSendError(null);
    const result = await postJson("/api/contact", {
      name: `${data.first.trim()} ${data.last.trim()}`,
      email: data.email.trim(),
      subject: data.topic,
      message: data.message.trim(),
    });
    setSending(false);
    if (result.ok) setDone(true);
    else setSendError("We couldn't send your message just now. Please try again.");
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Send a note to the room."
        intro="For general questions, topic ideas, collaborations, and media inquiries. Speaker interest belongs on the application page."
        action={false}
      />
      <section className="section-pad">
        <div className="site-container grid gap-10 lg:grid-cols-[.55fr_1fr]">
          <div>
            <h2>Thinking about taking part?</h2>
            <p className="mt-4 text-muted-foreground">
              Learn what recording day involves before you apply.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/join-a-conversation">Join a Conversation</Link>
            </Button>
          </div>
          <div>
            {done ? (
              <div className="paper-card p-10 text-center" role="status">
                <CheckCircle2 className="mx-auto h-10 w-10 text-purple" />
                <h2 className="mt-5">Your note arrived.</h2>
                <p className="mt-4 text-muted-foreground">
                  Thank you. The team will be in touch soon.
                </p>
              </div>
            ) : (
              <form
                className="paper-card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-10"
                onSubmit={submit}
                noValidate
              >
                <Honeypot value={trap} onChange={setTrap} />
                <Field label="First name" error={errors.first}>
                  <Input
                    value={data.first}
                    onChange={(e) => update("first", e.target.value)}
                    maxLength={60}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Last name" error={errors.last}>
                  <Input
                    value={data.last}
                    onChange={(e) => update("last", e.target.value)}
                    maxLength={60}
                    autoComplete="family-name"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email" error={errors.email}>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      maxLength={255}
                      autoComplete="email"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Topic" error={errors.topic}>
                    <select
                      value={data.topic}
                      onChange={(e) => update("topic", e.target.value)}
                      className="h-11 w-full border border-input bg-background px-3"
                    >
                      <option value="">Choose one</option>
                      {TOPICS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Message" error={errors.message}>
                    <Textarea
                      value={data.message}
                      onChange={(e) => update("message", e.target.value)}
                      maxLength={1500}
                      className="min-h-40"
                    />
                  </Field>
                </div>
                {sendError && (
                  <p className="field-error sm:col-span-2" role="alert">
                    {sendError}
                  </p>
                )}
                <Button
                  variant="apply"
                  size="lg"
                  type="submit"
                  disabled={sending}
                  className="sm:col-span-2"
                >
                  {sending ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
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
