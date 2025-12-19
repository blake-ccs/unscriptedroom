import { Link } from "react-router-dom";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const heroImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR Table Image.jpg",
  import.meta.url
).href;
const nineQuestionsImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/9 question frame.png",
  import.meta.url
).href;
const communityImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/community frame.png",
  import.meta.url
).href;
const principlesImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/conversation principle frame.png",
  import.meta.url
).href;
const chairImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR Chair Image.jpg",
  import.meta.url
).href;
const podcastImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/Screenshot 2025-12-19 at 7.17.59 AM.png",
  import.meta.url
).href;

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [heardFrom, setHeardFrom] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [envelopeWhere, setEnvelopeWhere] = useState("");
  const [daysError, setDaysError] = useState("");
  const [timesError, setTimesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isRegisterOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsRegisterOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isRegisterOpen]);

  useEffect(() => {
    if (!isSubmitted) {
      setShowThanks(false);
      return;
    }
    const id = requestAnimationFrame(() => setShowThanks(true));
    return () => cancelAnimationFrame(id);
  }, [isSubmitted]);

  const firstName = nameValue.trim().split(/\s+/)[0] || "friend";
  const toggleSelection = (
    value: string,
    current: string[],
    setter: Dispatch<SetStateAction<string[]>>
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const resetFormState = () => {
    setHeardFrom("");
    setNameValue("");
    setEnvelopeWhere("");
    setSelectedDays([]);
    setSelectedTimes([]);
    setDaysError("");
    setTimesError("");
    setSubmitError("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative isolate min-h-[88vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-none flex-col gap-10 px-6 py-8 sm:py-12">
          <header className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                resetFormState();
                setIsRegisterOpen(true);
              }}
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Register Interest
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                resetFormState();
                setIsRegisterOpen(true);
              }}
              className="rounded-full bg-[#e8d4b8] px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Contact Us
            </button>
          </header>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              The Unscripted Room
            </h1>
            <h2 className="mt-5 text-2xl font-medium text-white/90 drop-shadow-lg sm:text-3xl">
              Questions. Conversation. Community
            </h2>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="py-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-2xl font-medium text-black/80 sm:text-3xl lg:text-4xl">
              A space designed for real conversation.
              </p>
              <div className="mt-6 h-px w-full bg-black/30" />
            </div>
            <div className="mt-12 text-3xl font-semibold tracking-[0.3em] text-black/60 sm:text-4xl lg:text-5xl">
              INSIDE THE ROOM
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FlipCard
              title="9 Questions"
              imageUrl={nineQuestionsImageUrl}
              body={[
                "An intentionally developed sequence of nine questions guides the experience.",
                "They’re designed to open perspective, not prompt performance, helping the conversation move beyond the surface, naturally.",
              ]}
            />
            <FlipCard
              title="Community"
              imageUrl={communityImageUrl}
              body={[
                "The Unscripted Room is a group experience, bringing people from the community together in shared conversation.",
                "It reminds you that you’re not alone in how you think, or what you wrestle with.",
                "When strangers speak from real experience, and you see yourself in their words, that’s when community begins.",
              ]}
            />
            <FlipCard
              title="Conversation Principles"
              imageUrl={principlesImageUrl}
              body={[
                "Three principles that shape how the room is held.",
                "",
                "1. We strive to understand the difference between perspective and truth.",
                "We are here to listen and share from our lived experiences. In the Unscripted Room, our focus is on finding truth through the richness of differing perspectives.",
                "",
                "2. We are all equals.",
                "In this room, equality is expressed through how we listen, and how we learn from those who’ve turned time into wisdom. That wisdom is our opportunity.",
                "",
                "3. We choose curiosity over authority.",
                "Our goal is to find authentic connection through alignment. Curiosity is the social tool we use to get there.",
                "",
                "If we drift, we simply pause, reset, and return to curiosity.",
              ]}
            />
          </div>
        </section>

        <section className="grid items-center gap-8 pb-12 pt-4 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-xl">
            <h3 className="text-2xl font-semibold text-black sm:text-3xl">Join the Room!</h3>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              When was the last time you held two perspectives long enough for something deeper to emerge? Share your
              availability below, and we’ll reach out with an invitation to an upcoming session. Each room is
              intentionally small, and invitations are sent on a first-come, first-served basis
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  resetFormState();
                  setIsRegisterOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Register Interest
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-white/40 blur-2xl" aria-hidden="true" />
            <img
              src={chairImageUrl}
              alt="Unscripted Room chair"
              className="relative h-[360px] w-full rounded-[28px] object-cover shadow-2xl sm:h-[440px]"
            />
          </div>
        </section>

        <section className="grid items-center gap-8 pb-16 pt-2 lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-[32px] bg-white/40 blur-2xl" aria-hidden="true" />
            <img
              src={podcastImageUrl}
              alt="Unscripted Room podcast"
              className="relative h-[360px] w-full rounded-[28px] object-cover shadow-2xl sm:h-[440px]"
            />
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <h3 className="text-2xl font-semibold text-black sm:text-3xl">The Unscripted Room Podcast</h3>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              We&apos;re creating a companion podcast that will feature honest, curiosity-led conversations you can
              listen to anytime. More details coming soon.
            </p>
          </div>
        </section>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-8 transition ${
          isRegisterOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isRegisterOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition ${
            isRegisterOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsRegisterOpen(false)}
        />
        <div
          className={`relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-[#fbf7f1] shadow-2xl transition ${
            isRegisterOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Unscripted Room Registration"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <div className="text-lg font-semibold text-black">Unscripted Room Registration</div>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:shadow"
              aria-label="Close registration form"
            >
              X
            </button>
          </div>

          {isSubmitted ? (
            <div
              className={`px-6 py-10 text-center transition-all duration-500 ${
                showThanks ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8d4b8] text-2xl">
                ✨
              </div>
              <h4 className="mt-6 text-2xl font-semibold text-black">Thank you, {firstName}.</h4>
              <p className="mx-auto mt-3 max-w-xl text-base text-black/70">
                We&apos;re grateful you&apos;re interested in the Unscripted Room. We&apos;ll be in touch soon with
                next steps and an invitation.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setIsSubmitted(false);
                    resetFormState();
                  }}
                  className="rounded-full border border-black/10 bg-white px-6 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form
              className="max-h-[80vh] overflow-y-auto px-6 py-6 text-sm text-black/80"
              onSubmit={async (event) => {
                event.preventDefault();
                setDaysError("");
                setTimesError("");
                setSubmitError("");

                if (selectedDays.length === 0) {
                  setDaysError("Please select at least one day.");
                }
                if (selectedTimes.length === 0) {
                  setTimesError("Please select at least one time.");
                }
                if (selectedDays.length === 0 || selectedTimes.length === 0) {
                  return;
                }

                const formData = new FormData(event.currentTarget);
                const payload = {
                  name: formData.get("fullName"),
                  email: formData.get("email"),
                  ageConfirmed: formData.get("ageConfirmed") === "on",
                  days: selectedDays,
                  times: selectedTimes,
                  curiosityLevel: formData.get("curiosityLevel"),
                  heardFrom,
                  envelopeWhere: envelopeWhere || null,
                  curiosityReason: formData.get("curiosityReason"),
                  supportNotes: formData.get("supportNotes"),
                  updatesOptIn: formData.get("updatesOptIn") === "on",
                };

                if (heardFrom === "envelope" && !envelopeWhere.trim()) {
                  setSubmitError("Please tell us where the envelope found you.");
                  return;
                }

                setIsSubmitting(true);
                try {
                  const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!response.ok) {
                    throw new Error("Request failed");
                  }
                  setIsSubmitted(true);
                } catch (error) {
                  setSubmitError("We couldn’t submit your request just now. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black/70">Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={nameValue}
                    onChange={(event) => setNameValue(event.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black/70">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  id="age-check"
                  name="ageConfirmed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-black/20"
                  required
                />
                <label htmlFor="age-check" className="text-sm">
                  Are you 18 years of age or older?
                </label>
              </div>

              <div className="mt-8 text-xs font-semibold uppercase tracking-wide text-black/70">
                Availability Questions
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <label className="text-sm font-medium text-black/80">
                  What days of the week work best for you
                </label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-black/20"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleSelection(day, selectedDays, setSelectedDays)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
                {daysError && <div className="text-xs font-medium text-red-600">{daysError}</div>}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <div className="text-sm font-medium text-black/80">
                  What times of the day tend to work best where you can set aside up to 3 hours of your time?
                </div>
                <div className="flex flex-wrap gap-4">
                  {["Morning", "Afternoon", "Evening"].map((label) => (
                    <label key={label} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-black/20"
                        checked={selectedTimes.includes(label)}
                        onChange={() => toggleSelection(label, selectedTimes, setSelectedTimes)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {timesError && <div className="text-xs font-medium text-red-600">{timesError}</div>}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <label className="text-sm font-medium text-black/80">
                  How important is curiosity to you? (Scale 1-10)
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-black/60">1</span>
                  <input
                    type="range"
                    name="curiosityLevel"
                    min={1}
                    max={10}
                    defaultValue={5}
                    className="w-full accent-black"
                    required
                  />
                  <span className="text-xs text-black/60">10</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="text-sm font-medium text-black/80">How did you hear about us?</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { label: "I found an envelope", value: "envelope" },
                    { label: "Referral from a friend", value: "referral" },
                    { label: "Instagram", value: "instagram" },
                    { label: "Website", value: "website" },
                    { label: "Other", value: "other" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="heardFrom"
                        value={option.value}
                        checked={heardFrom === option.value}
                        onChange={(event) => setHeardFrom(event.target.value)}
                        className="h-4 w-4"
                        required={option.value === "envelope"}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {heardFrom === "envelope" && (
                <div className="mt-4 flex flex-col gap-2">
                  <label className="text-sm font-medium text-black/80">Where did the envelope find you?</label>
                  <input
                    type="text"
                    name="envelopeWhere"
                    value={envelopeWhere}
                    onChange={(event) => setEnvelopeWhere(event.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                    required
                  />
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <label className="text-sm font-medium text-black/80">What made you curious to join? (optional)</label>
                <textarea
                  name="curiosityReason"
                  className="min-h-[90px] rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <label className="text-sm font-medium text-black/80">
                  Anything we should know to support your experience? (optional)
                </label>
                <textarea
                  name="supportNotes"
                  className="min-h-[90px] rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                />
              </div>

              {submitError && <div className="mt-5 text-sm font-medium text-red-600">{submitError}</div>}

              <div className="mt-5 flex items-center gap-3">
                <input id="updates-check" name="updatesOptIn" type="checkbox" className="h-4 w-4 rounded border-black/20" />
                <label htmlFor="updates-check" className="text-sm">
                  I would like to receive future updates (optional)
                </label>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FlipCard({
  title,
  imageUrl,
  body,
}: {
  title: string;
  imageUrl: string;
  body: string[];
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsFlipped((v) => !v)}
      className="group h-[240px] w-full rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:h-[260px] lg:h-[280px]"
      aria-pressed={isFlipped}
      aria-label={`Flip card: ${title}`}
    >
      <div className="relative h-full w-full [perspective:1200px]">
        <div
          className="absolute inset-0 h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-[24px] bg-white shadow-xl [backface-visibility:hidden]">
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 h-full w-full rounded-[24px] bg-[#f5ede1] p-4 text-left shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5">
            <div className="text-lg font-semibold text-black">{title}</div>
            <div className="mt-3 max-h-[150px] space-y-2 overflow-y-auto pr-1 text-sm leading-relaxed text-black/80 sm:max-h-[170px]">
              {body.map((line, index) => (
                <p key={`${title}-${index}`} className={line ? "" : "h-3"}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
