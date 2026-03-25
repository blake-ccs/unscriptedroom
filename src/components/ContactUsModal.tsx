import type { ChangeEvent, Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import API_BASE from "../lib/apiBase";

export type ContactFormMode = "contact" | "podcast-guest" | "community-guest";

type ContactUsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialMode?: ContactFormMode;
};

const CONTACT_TOPICS = [
  "I’d like to be a podcast guest",
  "I have a question about The Unscripted Room",
  "I’m interested in attending a session",
  "I’d like to bring The Unscripted Room to my organization or community",
  "Something else",
] as const;

const EXPERIENCE_OPTIONS = [
  "People I have not yet met",
  "People I already know",
  "Experience this as a company event",
] as const;

const INTEREST_OPTIONS = [
  {
    value: "Craft",
    description: "Anything connected to the way you invest your time professionally.",
  },
  {
    value: "Relationships",
    description: "Family, friendships, marriage, dating, and the people who shape your life.",
  },
  {
    value: "Passions",
    description: "Hobbies, travel, creativity, and the ways you choose to spend your time.",
  },
] as const;

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const TIMES_OF_DAY = ["Morning", "Afternoon", "Evening"] as const;
const COMMUNICATION_OPTIONS = ["Email", "Text", "Phone - call"] as const;

export default function ContactUsModal({
  isOpen,
  onClose,
  initialTopic = "",
  initialMode = "podcast-guest",
}: ContactUsModalProps) {
  const [mode, setMode] = useState<ContactFormMode>("contact");
  const [modalScale, setModalScale] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [guestStep, setGuestStep] = useState(0);
  const [experiencePreference, setExperiencePreference] = useState("");
  const [conversationInterest, setConversationInterest] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [communicationPreferences, setCommunicationPreferences] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isGuestMode = mode !== "contact";

  const guestConfig = useMemo(() => {
    if (mode === "podcast-guest") {
      return {
        title: "BE A PODCAST GUEST",
        subject: "I’d like to be a podcast guest",
        experienceBody:
          "Being a guest on The Unscripted Room podcast is an opportunity to demonstrate what curiosity looks like to anyone who may need to see it.\n\nAll you need to do is be yourself, answer the questions honestly from your lived experience, and listen generously as others do the same.\n\nTo help us find the best flow for your podcast experience, we'd like to ask you a few questions and give you a few choices.",
        availabilityBody: "Please indicate your preferred availability for taking part in the Podcast.",
      };
    }

    if (mode === "community-guest") {
      return {
        title: "BE A COMMUNITY GUEST",
        subject: "I’d like to bring The Unscripted Room to my organization or community",
        experienceBody:
          "Being a guest in The Unscripted Room Community is an opportunity to demonstrate what curiosity looks like to anyone who may need to see it.\n\nAll you need to do is be yourself, answer the questions honestly from your lived experience, and listen generously as others do the same.\n\nTo help us find the best flow for your Community experience, we'd like to ask you a few questions and give you a few choices.",
        availabilityBody: "Please indicate your preferred availability for taking part in the Community Room.",
      };
    }

    return null;
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      const widthTarget = !isGuestMode ? 560 : 720;
      const heightTarget = !isGuestMode ? 520 : 760;
      const widthScale = (window.innerWidth - 32) / widthTarget;
      const heightScale = (window.innerHeight - 32) / heightTarget;
      setModalScale(Math.max(0.72, Math.min(0.96, widthScale, heightScale)));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [guestStep, isGuestMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setName("");
    setEmail("");
    setPhone("");
    setSubject(initialTopic || "");
    setMessage("");
    setGuestStep(0);
    setExperiencePreference("");
    setConversationInterest("");
    setPreferredDays([]);
    setPreferredTimes([]);
    setCommunicationPreferences([]);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setError("");
  }, [initialMode, initialTopic, isOpen]);

  if (!isOpen) return null;

  const toggleMultiValue = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const guestValidationError = () => {
    if (!isGuestMode) return "";
    if (guestStep === 0) {
      if (!name.trim() || !email.trim()) return "Please complete your contact details.";
      if (!experiencePreference) return "Please choose your experience preference.";
      return "";
    }
    if (guestStep === 1) {
      return conversationInterest ? "" : "Please choose the conversation that feels most interesting to you.";
    }
    if (!preferredDays.length || !preferredTimes.length || !communicationPreferences.length) {
      return "Please choose at least one option in each availability section.";
    }
    return "";
  };

  const handleGuestNext = () => {
    const nextError = guestValidationError();
    if (nextError) {
      setError(nextError);
      return;
    }
    setError("");
    if (guestStep === 0 && experiencePreference === "Experience this as a company event") {
      setConversationInterest("");
      setGuestStep(2);
      return;
    }
    setGuestStep((current) => Math.min(current + 1, 2));
  };

  const buildGuestMessage = () =>
    [
      `Application Type: ${guestConfig?.subject || ""}`,
      `Phone Number: ${phone}`,
      `Experience Preference: ${experiencePreference}`,
      `Primary Conversation Interest: ${conversationInterest}`,
      `Preferred Days: ${preferredDays.join(", ")}`,
      `Preferred Time of Day: ${preferredTimes.join(", ")}`,
      `Communication Preference: ${communicationPreferences.join(", ")}`,
    ].join("\n");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!isGuestMode) {
      if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
        setError("Please complete all fields.");
        return;
      }
    } else {
      const nextError = guestValidationError();
      if (nextError) {
        setError(nextError);
        return;
      }
    }

    if (!name.trim() || !email.trim()) {
      setError("Please complete all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [firstName, ...lastParts] = name.trim().split(/\s+/);
      const response = await fetch(
        !isGuestMode ? `${API_BASE}/api/contact` : `${API_BASE}/api/lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            !isGuestMode
              ? {
                  name,
                  email,
                  subject,
                  message,
                }
              : {
                  email,
                  firstName,
                  lastName: lastParts.join(" "),
                  phone,
                  offer: mode,
                  source: "web",
                  experiencePreference,
                  preferredCommunicationMethod: communicationPreferences.join(", "),
                  preferredDay: preferredDays.join(", "),
                  preferredTime: preferredTimes.join(", "),
                  reasonsForSignup: experiencePreference,
                  reasonsForJoining:
                    conversationInterest || (experiencePreference === "Experience this as a company event" ? experiencePreference : ""),
                  bioAboutMe: buildGuestMessage(),
                }
          ),
        }
      );
      if (!response.ok) throw new Error("Request failed");
      setIsSubmitted(true);
    } catch {
      setError("We couldn’t send your message just now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 transition sm:px-5 sm:py-5" aria-hidden={!isOpen}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-full max-w-[min(92vw,720px)] overflow-hidden rounded-[18px] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={guestConfig?.title || "Contact Us"}
        onClick={(event) => event.stopPropagation()}
        style={{ transform: `scale(${modalScale})`, transformOrigin: "center center" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D5C7E2] bg-white text-[10px] font-semibold text-[#7A3168] transition hover:bg-[#F8F3FB]"
          aria-label="Close contact form"
        >
          X
        </button>

        {isSubmitted ? (
          <div className="px-5 py-8 text-center sm:px-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D5C7E2] text-2xl text-[#7A3168]">
              ✓
            </div>
            <h4 className="mt-4 text-2xl font-semibold text-[#231F20]">
              {isGuestMode ? "Application sent." : "Message sent."}
            </h4>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#5B6064]">
              {isGuestMode
                ? "Thanks for sharing your preferences. We’ll review your submission and be in touch soon."
                : "Thanks for reaching out. We’ll review your message and respond soon."}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                  className="inline-flex min-w-28 items-center justify-center rounded-[10px] border border-[#7A3168] bg-white px-4 py-2 text-sm font-medium text-[#7A3168] transition hover:bg-[#F8F3FB]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form className="max-h-[calc(100vh-3rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4" onSubmit={handleSubmit}>
            <h3 className="text-center text-[1.05rem] font-bold tracking-[0.08em] text-[#7A3168] sm:text-[1.18rem]">
              {isGuestMode ? guestConfig?.title : "CONTACT US"}
            </h3>

            {!isGuestMode ? (
              <div className="mt-4">
                <div className="grid gap-2.5 md:grid-cols-2">
                  <Field label="Name">
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Full Name"
                      className={inputClassName}
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email Address"
                      className={inputClassName}
                      required
                    />
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="Choose a topic">
                    <select
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className={inputClassName}
                      required
                    >
                      <option value="" disabled>
                        Choose a topic
                      </option>
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="Message">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Write your message"
                      rows={5}
                      className={`${inputClassName} resize-none`}
                      required
                    />
                  </Field>
                </div>
              </div>
            ) : guestStep === 0 && (
              <div className="mt-3">
                <div className="grid gap-2 md:grid-cols-[1fr_0.82fr]">
                  <Field label="Name">
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Full Name"
                      className={inputClassName}
                      required
                    />
                  </Field>
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 555 - 5555"
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <div className="mt-2.5">
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email Address"
                      className={inputClassName}
                      required
                    />
                  </Field>
                </div>

                <StepHeading className="mt-3">Experience Preference</StepHeading>
                <InfoPanel>{guestConfig?.experienceBody || ""}</InfoPanel>

                <PromptCard className="mt-3">
                  When you imagine having an amazing conversation, who do you picture having it with?
                </PromptCard>

                <OptionPanel className="mt-2.5">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <RadioRow
                      key={option}
                      label={option}
                      checked={experiencePreference === option}
                      onChange={() => setExperiencePreference(option)}
                    />
                  ))}
                </OptionPanel>

                <p className="mt-2 text-[10px] font-medium text-[#7A3168]">Phone number is optional.</p>
              </div>
            )}

            {isGuestMode && guestStep === 1 && (
              <div className="mt-3">
                <StepHeading>Primary Conversation Interest</StepHeading>
                <InfoPanel>Great conversations usually begin with a shared doorway into life.</InfoPanel>

                <PromptCard className="mt-3">
                  Which kind of conversation feels most interesting to you right now?
                </PromptCard>

                <OptionPanel className="mt-2.5">
                  {INTEREST_OPTIONS.map((option) => (
                    <RadioRow
                      key={option.value}
                      label={option.value}
                      description={option.description}
                      checked={conversationInterest === option.value}
                      onChange={() => setConversationInterest(option.value)}
                    />
                  ))}
                </OptionPanel>
              </div>
            )}

            {isGuestMode && guestStep === 2 && (
              <div className="mt-3">
                <StepHeading>Availability Selection</StepHeading>
                <InfoPanel>{guestConfig?.availabilityBody || ""}</InfoPanel>

                <div className="mt-3 space-y-2.5">
                  <div>
                    <StepHeading className="text-[1.05rem]">Days of Week</StepHeading>
                    <SelectionCard className="mt-1.5">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {DAYS_OF_WEEK.map((day) => (
                          <ChoicePill
                            key={day}
                            label={day}
                            selected={preferredDays.includes(day)}
                            onClick={() => toggleMultiValue(day, setPreferredDays)}
                          />
                        ))}
                      </div>
                    </SelectionCard>
                  </div>

                  <div>
                    <StepHeading className="text-[1.05rem]">Time of Day</StepHeading>
                    <SelectionCard className="mt-1.5 bg-[#D5C7E2]">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {TIMES_OF_DAY.map((time) => (
                          <ChoicePill
                            key={time}
                            label={time}
                            selected={preferredTimes.includes(time)}
                            onClick={() => toggleMultiValue(time, setPreferredTimes)}
                          />
                        ))}
                      </div>
                    </SelectionCard>
                  </div>

                  <div>
                    <StepHeading className="text-[1.05rem]">Communication Preference</StepHeading>
                    <SelectionCard className="mt-1.5">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {COMMUNICATION_OPTIONS.map((option) => (
                          <ChoicePill
                            key={option}
                            label={option}
                            selected={communicationPreferences.includes(option)}
                            onClick={() => toggleMultiValue(option, setCommunicationPreferences)}
                          />
                        ))}
                      </div>
                    </SelectionCard>
                    <p className="mt-1.5 text-[10px] font-medium text-[#7A3168]">*Please select all that apply</p>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="mt-4 text-xs font-semibold text-red-600">{error}</div>}

            <div className="mt-3.5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              {!isGuestMode ? (
                <>
                  <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  <button type="button" onClick={onClose} className={secondaryButtonClassName}>
                    Cancel
                  </button>
                </>
              ) : guestStep === 0 ? (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      event.preventDefault();
                      handleGuestNext();
                    }}
                    className={primaryButtonClassName}
                  >
                    Next
                  </button>
                  <button type="button" onClick={onClose} className={secondaryButtonClassName}>
                    Cancel
                  </button>
                </>
              ) : guestStep === 1 ? (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      event.preventDefault();
                      handleGuestNext();
                    }}
                    className={primaryButtonClassName}
                  >
                    Next
                  </button>
                  <button type="button" onClick={() => setGuestStep(0)} className={secondaryButtonClassName}>
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGuestStep(experiencePreference === "Experience this as a company event" ? 0 : 1)
                    }
                    className={secondaryButtonClassName}
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[0.82rem] font-semibold text-[#7A3168]">{label}</div>
      {children}
    </label>
  );
}

function StepHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h4 className={`text-[1.18rem] font-semibold leading-tight text-[#231F20] ${className}`}>{children}</h4>;
}

function InfoPanel({ children }: { children: string }) {
  return (
    <div className="mt-2.5 rounded-[12px] bg-[#D5C7E2] px-3 py-3 text-[0.78rem] leading-relaxed text-[#3B2C57] whitespace-pre-line">
      {children}
    </div>
  );
}

function PromptCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] border border-[#F0E6F0] bg-white px-3 py-3 text-[0.92rem] font-medium leading-snug text-[#B86BA3] shadow-[0_8px_20px_rgba(35,31,32,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function OptionPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[14px] bg-[#D5C7E2] px-3 py-3 shadow-[0_8px_20px_rgba(35,31,32,0.06)] ${className}`}>{children}</div>;
}

function SelectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`rounded-[12px] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(35,31,32,0.08)] ${className}`}>{children}</div>;
}

function RadioRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
      <span
        className={`mt-0.5 h-5 w-5 rounded-full border-[2px] transition ${
          checked ? "border-[#7A3168] bg-[#7A3168]" : "border-[#9BB0C1] bg-white"
        }`}
      />
      <span className="block">
        <span className="block text-[0.88rem] font-semibold text-[#231F20]">{label}</span>
        {description ? <span className="mt-0.5 block text-[0.74rem] leading-relaxed text-[#5B6064]">{description}</span> : null}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  );
}

function ChoicePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left">
      <span
        className={`h-5 w-5 rounded-full border-[2px] transition ${
          selected ? "border-[#7A3168] bg-[#7A3168]" : "border-[#9BB0C1] bg-white"
        }`}
      />
      <span className="text-[0.82rem] font-medium text-[#231F20]">{label}</span>
    </button>
  );
}

const inputClassName =
  "w-full rounded-[10px] border border-[#C8A7C7] bg-white px-3 py-2.5 text-sm text-[#231F20] outline-none transition placeholder:text-[#C8B9CC] focus:border-[#7A3168] focus:ring-2 focus:ring-[#D5C7E2]";

const primaryButtonClassName =
  "inline-flex min-w-32 items-center justify-center rounded-[10px] bg-[#7A3168] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3B2C57] disabled:cursor-not-allowed disabled:opacity-70";

const secondaryButtonClassName =
  "inline-flex min-w-32 items-center justify-center rounded-[10px] border border-[#C8A7C7] bg-white px-5 py-2.5 text-sm font-medium text-[#7A3168] transition hover:bg-[#F8F3FB]";
