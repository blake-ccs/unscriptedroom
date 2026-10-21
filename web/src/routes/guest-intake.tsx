import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Honeypot } from "@/components/site/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api";
import { episodeSlug, findEpisodeBySlug, formatRecordingDate, seasonTwo } from "@/lib/site-data";

// Unlisted page for confirmed guests, linked from emails as /guest-intake?episode=<slug>.
// Kept out of navigation, the sitemap and search (noindex here + X-Robots-Tag in public/_headers).
// Submissions go to the existing POST /api/lead endpoint (see the submit handler for the mapping).
const searchSchema = z.object({ episode: z.string().max(80).optional() });

export const Route = createFileRoute("/guest-intake")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Before We Sit Down | The Unscripted Room" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuestIntakePage,
});

const TAGGING_OPTIONS = ["Yes", "No", "Please ask me first"] as const;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  aboutYou: string;
  website: string;
  instagram: string;
  facebook: string;
  episode: string;
  drawnTo: string;
  experience: string;
  hopeToExplore: string;
  avoidTopics: string;
  taggingConsent: string;
  anythingElse: string;
};
const empty: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  aboutYou: "",
  website: "",
  instagram: "",
  facebook: "",
  episode: "",
  drawnTo: "",
  experience: "",
  hopeToExplore: "",
  avoidTopics: "",
  taggingConsent: "",
  anythingElse: "",
};

function GuestIntakePage() {
  const { episode: episodeParam } = Route.useSearch();
  const [data, setData] = React.useState<FormData>(empty);
  const [lockedEpisode, setLockedEpisode] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [trap, setTrap] = React.useState("");
  const update = (key: keyof FormData, value: string) =>
    setData((current) => ({ ...current, [key]: value }));

  // The page is prerendered without a query string, so apply ?episode= after hydration.
  React.useEffect(() => {
    const match = findEpisodeBySlug(episodeParam);
    if (match) {
      setData((current) => ({ ...current, episode: episodeSlug(match.title) }));
      setLockedEpisode(true);
    }
  }, [episodeParam]);

  const selected = findEpisodeBySlug(data.episode);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!data.firstName.trim()) next.firstName = "First name is required.";
    if (!data.lastName.trim()) next.lastName = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) next.email = "Enter a valid email address.";
    if (!selected) next.episode = "Choose the conversation you're joining.";
    if (!data.drawnTo.trim()) next.drawnTo = "A sentence or two is plenty.";
    if (!data.taggingConsent) next.taggingConsent = "Choose one option.";
    setErrors(next);
    if (Object.keys(next).length) {
      setSendError("A few answers still need your attention.");
      return;
    }
    if (sending) return;
    if (trap) {
      setDone(true);
      return;
    }
    setSending(true);
    setSendError(null);
    // Sent to the existing guest endpoint (POST /api/lead); the server code is not modified.
    // ActiveCampaign result: contact upserted; tags offer:guest-intake and
    // podcast:conversation-interest:<episode>; Instagram in its own field; every answer in the
    // contact's Bio / About Me field as one labelled block (this replaces what was there).
    const episode = selected!;
    const answer = (value: string) => value.trim() || "(not answered)";
    const bio = [
      `GUEST INTAKE: ${episode.title} (recording ${formatRecordingDate(episode.recordingDate)})`,
      `Submitted: ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`,
      "",
      `About you: ${answer(data.aboutYou)}`,
      `Website: ${answer(data.website)}`,
      `Instagram: ${answer(data.instagram)}`,
      `Facebook: ${answer(data.facebook)}`,
      "",
      `What drew you to this conversation: ${answer(data.drawnTo)}`,
      `Experience or perspective to bring: ${answer(data.experience)}`,
      `Hopes we explore: ${answer(data.hopeToExplore)}`,
      `Prefers not to discuss: ${answer(data.avoidTopics)}`,
      `OK to tag in clips/photos: ${data.taggingConsent}`,
      `Anything else to know: ${answer(data.anythingElse)}`,
    ].join("\n");
    const result = await postJson("/api/lead", {
      email: data.email.trim().toLowerCase(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      offer: "guest-intake",
      source: "web",
      reasonsForJoining: episode.title,
      instagramHandle: data.instagram.trim(),
      bioAboutMe: bio,
    });
    setSending(false);
    if (result.ok) {
      setDone(true);
      window.scrollTo({ top: 0 });
    } else {
      setSendError(
        "We couldn't send your responses just now. Your answers are still here. Please try again in a moment.",
      );
    }
  }

  if (done)
    return (
      <section className="paper-texture section-pad min-h-[70svh]">
        <div className="site-container max-w-2xl text-center" role="status">
          <CheckCircle2 className="mx-auto h-12 w-12 text-purple" aria-hidden="true" />
          <h1 className="mt-6">You're all set!</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Thanks for taking a few minutes to share a little about yourself. We're looking forward
            to having you join us at The Unscripted Room!
          </p>
        </div>
      </section>
    );

  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10 max-w-3xl">
          <h1 className="text-warm-white">Before we sit down</h1>
          <div className="mt-6 space-y-4 text-lg text-warm-white/75">
            <p>We're looking forward to having you join us at The Unscripted Room!</p>
            <p>
              Before we get together, we'd like to learn a little more about you and the perspective
              you'll bring to the conversation.
            </p>
            <p>
              There are no right or wrong answers. This simply helps us get to know you before we
              sit down.
            </p>
          </div>
          <p className="rule-label mt-8 text-chartreuse">About 5 minutes to complete</p>
        </div>
      </section>

      <section className="paper-texture section-pad">
        <div className="site-container max-w-3xl">
          <form onSubmit={submit} noValidate className="relative grid gap-14">
            <Honeypot value={trap} onChange={setTrap} />

            {lockedEpisode && selected ? (
              <div className="border-l-4 border-chartreuse bg-soft-sage px-6 py-5">
                <p className="eyebrow">Your upcoming conversation</p>
                <p className="mt-3 font-headline text-2xl font-semibold uppercase">
                  {selected.title}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Recording:{" "}
                  <time dateTime={selected.recordingDate}>
                    {formatRecordingDate(selected.recordingDate)}
                  </time>
                </p>
                <p className="mt-2 text-muted-foreground">{selected.question}</p>
                <button
                  type="button"
                  onClick={() => setLockedEpisode(false)}
                  className="mt-3 text-xs font-semibold uppercase tracking-[.14em] text-foreground underline underline-offset-4 hover:text-purple"
                >
                  Not your conversation? Choose another
                </button>
              </div>
            ) : (
              <Field label="Which conversation are you joining?" error={errors.episode}>
                <select
                  value={data.episode}
                  onChange={(e) => update("episode", e.target.value)}
                  className="h-11 w-full border border-input bg-background px-3"
                >
                  <option value="">Choose your conversation</option>
                  {seasonTwo.map((ep) => (
                    <option key={ep.n} value={episodeSlug(ep.title)}>
                      {ep.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <FormSection title="A little about you">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="First name" error={errors.firstName}>
                  <Input
                    value={data.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    maxLength={60}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <Input
                    value={data.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    maxLength={60}
                    autoComplete="family-name"
                  />
                </Field>
              </div>
              <Field label="Email address" error={errors.email}>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={255}
                  autoComplete="email"
                />
              </Field>
              <Field
                label="Tell us a little about yourself. (Optional)"
                hint="This could include what you do, your interests, your background, or anything else you'd like us to know before the conversation."
              >
                <Textarea
                  value={data.aboutYou}
                  onChange={(e) => update("aboutYou", e.target.value)}
                  maxLength={3000}
                  className="min-h-36"
                />
              </Field>
              <fieldset>
                <legend className="form-label">Website and social media (Optional)</legend>
                <span className="-mt-1 mb-3 block text-sm text-muted-foreground">
                  Feel free to share any you&apos;d like us to have.
                </span>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Website">
                    <Input
                      value={data.website}
                      onChange={(e) => update("website", e.target.value)}
                      maxLength={150}
                      inputMode="url"
                      autoComplete="url"
                      placeholder="yourwebsite.com"
                    />
                  </Field>
                  <Field label="Instagram">
                    <Input
                      value={data.instagram}
                      onChange={(e) => update("instagram", e.target.value)}
                      maxLength={150}
                      placeholder="@handle or link"
                    />
                  </Field>
                  <Field label="Facebook">
                    <Input
                      value={data.facebook}
                      onChange={(e) => update("facebook", e.target.value)}
                      maxLength={150}
                      placeholder="Handle or link"
                    />
                  </Field>
                </div>
              </fieldset>
            </FormSection>

            <FormSection title="Your perspective">
              <Field label="What drew you to this particular conversation?" error={errors.drawnTo}>
                <Textarea
                  value={data.drawnTo}
                  onChange={(e) => update("drawnTo", e.target.value)}
                  maxLength={3000}
                  className="min-h-36"
                />
              </Field>
              <Field
                label="Is there a personal experience, story, or perspective you might want to bring into the conversation? (Optional)"
                hint="No need to prepare anything formal. We're just interested in what comes to mind."
              >
                <Textarea
                  value={data.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  maxLength={3000}
                  className="min-h-36"
                />
              </Field>
              <Field label="Is there something you hope we explore during the conversation? (Optional)">
                <Textarea
                  value={data.hopeToExplore}
                  onChange={(e) => update("hopeToExplore", e.target.value)}
                  maxLength={3000}
                  className="min-h-32"
                />
              </Field>
              <Field
                label="Are there any topics or experiences you'd prefer not to discuss? (Optional)"
                hint="We want everyone to feel comfortable sharing their perspective. It's completely fine to let us know."
              >
                <Textarea
                  value={data.avoidTopics}
                  onChange={(e) => update("avoidTopics", e.target.value)}
                  maxLength={3000}
                  className="min-h-32"
                />
              </Field>
            </FormSection>

            <FormSection title="A few final details">
              <fieldset>
                <legend className="form-label">
                  Are you comfortable with us tagging you when we share clips or photos from the
                  episode?
                </legend>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                  {TAGGING_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-base">
                      <input
                        type="radio"
                        name="taggingConsent"
                        value={option}
                        checked={data.taggingConsent === option}
                        onChange={() => update("taggingConsent", option)}
                        className="h-4 w-4 accent-[var(--color-purple)]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.taggingConsent && (
                  <span className="field-error" role="alert">
                    {errors.taggingConsent}
                  </span>
                )}
              </fieldset>
              <Field label="Anything else you'd like us to know before we meet? (Optional)">
                <Textarea
                  value={data.anythingElse}
                  onChange={(e) => update("anythingElse", e.target.value)}
                  maxLength={3000}
                  className="min-h-32"
                />
              </Field>
            </FormSection>

            <div className="border-t border-foreground/25 pt-8">
              <p className="text-sm text-muted-foreground">
                Your responses will only be shared with The Unscripted Room team to help us prepare
                for your conversation.
              </p>
              {sendError && (
                <p className="field-error mt-4" role="alert">
                  {sendError}
                </p>
              )}
              <Button
                type="submit"
                variant="apply"
                size="lg"
                disabled={sending}
                className="mt-6 w-full sm:w-auto"
              >
                {sending ? (
                  "Sending…"
                ) : (
                  <>
                    Send my responses <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-7 border-t border-foreground/25 pt-8">
      <legend className="float-left mb-1 w-full">
        <h2>{title}</h2>
      </legend>
      {children}
    </fieldset>
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
