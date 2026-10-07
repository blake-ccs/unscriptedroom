import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api";

// Post-session reflection survey. Linked from ActiveCampaign emails — keep the URL and payload stable.
export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "Post-Session Reflection Survey | The Unscripted Room" },
      {
        name: "description",
        content: "Share your reflections after an Unscripted Room conversation.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SurveyPage,
});

type SurveyForm = {
  email: string;
  name: string;
  impactLevel: string;
  honestySpace: string;
  standoutMoment: string;
  betterExperience: string;
  attendAgain: string;
  availability: string[];
  podcastInterest: string;
  anythingElse: string;
};

const initialForm: SurveyForm = {
  email: "",
  name: "",
  impactLevel: "",
  honestySpace: "",
  standoutMoment: "",
  betterExperience: "",
  attendAgain: "",
  availability: [],
  podcastInterest: "",
  anythingElse: "",
};

const SCALE = ["1", "2", "3", "4", "5"];
const ATTEND_AGAIN = ["Yes", "Maybe", "Not right now"];
const AVAILABILITY = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
  "My availability varies",
  "Not sure yet",
];
const PODCAST_INTEREST = ["Yes", "Maybe", "Not at this time"];

// Visitors who signed in on the previous site keep these in localStorage on this domain.
function readStored(key: string) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function SurveyPage() {
  const [form, setForm] = React.useState<SurveyForm>(initialForm);
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const email = readStored("auth_email");
    if (email) setForm((prev) => (prev.email ? prev : { ...prev, email }));
  }, []);

  const update = (key: Exclude<keyof SurveyForm, "availability">, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const toggleAvailability = (value: string) =>
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter((item) => item !== value)
        : [...prev.availability, value],
    }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    const problem = !form.name.trim()
      ? "Please enter your name."
      : !/^\S+@\S+\.\S+$/.test(form.email.trim())
        ? "Enter a valid email address."
        : !form.impactLevel
          ? "Question 1 is required."
          : !form.honestySpace
            ? "Question 2 is required."
            : !form.attendAgain
              ? "Question 5 is required."
              : !form.availability.length
                ? "Question 6 is required."
                : "";
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSending(true);
    const result = await postJson(
      "/api/survey",
      { ...form, email: form.email.trim() },
      { token: readStored("access_token") },
    );
    setSending(false);
    if (result.ok) setSubmitted(true);
    else setError("We couldn't submit your survey. Please try again.");
  }

  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">Post-Session Reflection Survey</h1>
          <p className="mt-6 max-w-2xl text-lg text-warm-white/70">
            Thank you for taking the time to reflect. Your perspective helps shape future
            conversations.
          </p>
        </div>
      </section>

      <section className="paper-texture groove-light section-pad">
        <div className="site-container max-w-3xl">
          {submitted ? (
            <div className="paper-card p-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10 text-purple" />
              <h2 className="mt-5">Thanks for sharing.</h2>
              <p className="mt-4 text-muted-foreground">
                Your reflections were recorded. We appreciate your thoughtfulness.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="paper-card grid gap-10 p-6 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="form-label">Name</span>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="form-label">Email</span>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                  />
                </label>
              </div>

              <Group title="Reflection">
                <ChoiceRow
                  legend="1. How impactful was this conversation for you? (Scale 1-5)"
                  name="impactLevel"
                  options={SCALE}
                  value={form.impactLevel}
                  onChange={(v) => update("impactLevel", v)}
                  pills
                />
                <ChoiceRow
                  legend="2. Did the room feel like a space where you could show up honestly? (Scale 1-5)"
                  name="honestySpace"
                  options={SCALE}
                  value={form.honestySpace}
                  onChange={(v) => update("honestySpace", v)}
                  pills
                />
                <label className="block">
                  <span className="form-label">
                    3. What stood out most about the experience? (Optional)
                  </span>
                  <Textarea
                    value={form.standoutMoment}
                    onChange={(e) => update("standoutMoment", e.target.value)}
                    maxLength={2000}
                    className="min-h-24"
                  />
                </label>
                <label className="block">
                  <span className="form-label">
                    4. What, if anything, would make the experience even better? (Optional)
                  </span>
                  <Textarea
                    value={form.betterExperience}
                    onChange={(e) => update("betterExperience", e.target.value)}
                    maxLength={2000}
                    className="min-h-24"
                  />
                </label>
              </Group>

              <Group title="Looking forward">
                <ChoiceRow
                  legend="5. Would you join another Unscripted Room?"
                  name="attendAgain"
                  options={ATTEND_AGAIN}
                  value={form.attendAgain}
                  onChange={(v) => update("attendAgain", v)}
                />
                <fieldset>
                  <legend className="form-label">
                    6. When would you most likely attend another session?
                  </legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {AVAILABILITY.map((value) => (
                      <label key={value} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={form.availability.includes(value)}
                          onChange={() => toggleAvailability(value)}
                          className="h-4 w-4 accent-[var(--color-purple)]"
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </Group>

              <Group title="Podcast invitation">
                <ChoiceRow
                  legend="7. Would you be open to participating in a future Unscripted Room podcast conversation?"
                  name="podcastInterest"
                  options={PODCAST_INTEREST}
                  value={form.podcastInterest}
                  onChange={(v) => update("podcastInterest", v)}
                />
                <label className="block">
                  <span className="form-label">
                    Optional: Is there anything else you’d like to share?
                  </span>
                  <Textarea
                    value={form.anythingElse}
                    onChange={(e) => update("anythingElse", e.target.value)}
                    maxLength={2000}
                    className="min-h-24"
                  />
                </label>
              </Group>

              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" variant="apply" size="lg" disabled={sending}>
                {sending ? "Submitting…" : "Submit feedback"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-foreground/25 pt-6">
      <p className="eyebrow">{title}</p>
      <div className="mt-6 grid gap-7">{children}</div>
    </div>
  );
}

function ChoiceRow({
  legend,
  name,
  options,
  value,
  onChange,
  pills = false,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  pills?: boolean;
}) {
  return (
    <fieldset>
      <legend className="form-label">{legend}</legend>
      <div className={`mt-2 flex flex-wrap ${pills ? "gap-2" : "gap-5"}`}>
        {options.map((option) =>
          pills ? (
            <label
              key={option}
              className={`grid h-11 min-w-11 cursor-pointer place-items-center border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                value === option
                  ? "border-purple bg-purple text-warm-white"
                  : "border-foreground/25 bg-background hover:border-plum"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          ) : (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="h-4 w-4 accent-[var(--color-purple)]"
              />
              {option}
            </label>
          ),
        )}
      </div>
    </fieldset>
  );
}
