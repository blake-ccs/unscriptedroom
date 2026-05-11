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
const SMS_OPT_IN_COPY =
  "By providing your phone number, you agree to receive text messages from The Unscripted Room. We will only message you regarding your expressed interest. Message and data rates may apply.";
const agreementLogoUrl = new URL("../assets/UR LOGO dark.png", import.meta.url).href;
const PODCAST_GUEST_CONTRACT_URL = (import.meta.env.VITE_PODCAST_GUEST_CONTRACT_URL as string | undefined)?.trim() || "";
const PODCAST_GUEST_CONTRACT_TEXT = `
Guest Participation Agreement
The Unscripted Room Podcast

The conversations that take place in The Unscripted Room are meant to be real, thoughtful, and
unfiltered. Each conversation is an opportunity to explore ideas, perspectives, and lived experiences
with curiosity and openness.

By participating, you are helping create a space where honest conversation can unfold and where
others listening may discover perspectives they might not otherwise encounter.

Because this is a podcast, the conversation will be recorded and later shared publicly as part of the
show and related content. Before we begin, we want to make sure everyone participating understands
how the recording may be used and feels comfortable moving forward.

The intention of The Unscripted Room is to create space for thoughtful conversation, curiosity, and
shared perspective. This agreement simply helps ensure those conversations can be shared
responsibly while respecting the people who take part in them.

What Participation Involves
This conversation will be recorded in audio and/or video format. The recording may include your voice,
image, likeness, name, and statements made during the discussion.

Content from the recording may appear in places such as:
• The Unscripted Room Podcast episode
• Video recordings of the conversation
• Short clips or excerpts from the discussion
• The Unscripted Room website
• Social media platforms
• Promotional or marketing materials connected to the podcast
• Educational or editorial content related to the show
• Podcast platforms such as Apple Podcasts, Spotify, YouTube, and similar services

The goal of sharing these recordings is to extend the conversation beyond the room so others can
listen, reflect, and engage with the ideas explored during the discussion.

Editing and Production
The Unscripted Room is designed to capture conversation as it happens.

Our goal is to share conversations in a way that reflects how they actually unfolded in the room. We do
not edit conversations to reshape, reinterpret, or change the meaning of what was shared.

Our role is to create the environment for the conversation and record it with care. In post-production, we
may align audio for clarity, address technical issues, and integrate the opening sequence, while
keeping the conversation itself intact.

This approach is intentional.

We believe that trust with our audience, and with the people who choose to participate, comes from
sharing conversations as they naturally unfold.

Authenticity in conversation matters more to us than producing something polished or performative.
That includes moments of clarity, uncertainty, reflection, and even discomfort.

At times, something said in the moment may feel different when reflected on later. We recognize that as
part of the nature of real conversation and personal growth, not something that should automatically be
edited away.

Because of this, we provide a reflection window after the recording so participants have time to
consider their experience before anything is shared publicly.

48-Hour Reflection Window
After the conversation is recorded, we provide a 48-hour reflection window before anything is publicly
shared. This time is intended to give participants space to reflect on the experience and feel confident
about what was shared during the conversation.

If within that window you decide that you would prefer not to have your participation included in publicly
shared content, you can simply let us know and we will honor that request. Your portion of the
conversation will not be published.

We offer this reflection period because conversations in The Unscripted Room are designed to be
open, thoughtful, and sometimes deeply personal. Providing this space allows participants to revisit the
experience with clarity and comfort before the conversation is shared with a wider audience.

After the 48-hour reflection window has passed, the recording may be released and distributed as part
of the podcast and related materials.

Sharing the Conversation
By participating, you grant The Unscripted Room Podcast permission to record and share your voice,
image, likeness, name, and statements captured during the conversation.

This allows the conversation to be published as part of podcast episodes, video recordings, short clips,
and related materials across podcast platforms, websites, social media, and other spaces where the
show is shared.

All recordings, transcripts, and related materials created from the conversation become part of The
Unscripted Room Podcast archive and may be used to support the podcast and its mission of sharing
thoughtful conversations with a wider audience.

Voluntary Participation
Participation in The Unscripted Room Podcast is entirely voluntary.

Guests do not receive financial compensation, royalties, or other payment for participating or for the
use of recorded content. Most participants choose to take part because they value the opportunity to
share ideas, perspectives, and experiences with a broader audience.

Responsibility for Statements
While we take care to present conversations honestly and respectfully, each participant remains
responsible for the statements and perspectives they choose to share during the discussion.

By participating in this agreement, you acknowledge that The Unscripted Room Podcast and its
owners, employees, partners, and collaborators are not responsible for claims that may arise from
statements made during the recording or from the publication of the conversation as described in this
document.

Additional Acknowledgements
By participating, you confirm that you have read and understand the terms described in this agreement
and feel comfortable participating in the conversation under those conditions.

To ensure clarity for everyone involved, we also ask guests to confirm the following:
• You are at least eighteen (18) years of age
• You have the authority to participate in this recording and grant the permissions described above
• Your participation in this conversation does not violate any agreements or obligations you may
have with another individual, employer, or organization

Because The Unscripted Room is built around real conversation and honest perspective, participants
remain responsible for the views and statements they choose to share.

Participation in the podcast is voluntary, and guests are always welcome to ask questions about this
agreement before participating.

Thank you for being willing to take part in this conversation. The Unscripted Room exists because
people are open to sharing their perspectives, listening to others, and exploring ideas with curiosity and
respect. We’re grateful for your willingness to be part of that experience.
`.trim();

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
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [guestStep, setGuestStep] = useState(0);
  const [experiencePreference, setExperiencePreference] = useState("");
  const [conversationInterest, setConversationInterest] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [communicationPreferences, setCommunicationPreferences] = useState<string[]>([]);
  const [hasOpenedGuestAgreement, setHasOpenedGuestAgreement] = useState(false);
  const [hasAcceptedGuestAgreement, setHasAcceptedGuestAgreement] = useState(false);
  const [isGuestAgreementOpen, setIsGuestAgreementOpen] = useState(false);
  const [isAgreementScrolledToEnd, setIsAgreementScrolledToEnd] = useState(false);
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
    setSmsOptIn(false);
    setSubject(initialTopic || "");
    setMessage("");
    setGuestStep(0);
    setExperiencePreference("");
    setConversationInterest("");
    setPreferredDays([]);
    setPreferredTimes([]);
    setCommunicationPreferences([]);
    setHasOpenedGuestAgreement(false);
    setHasAcceptedGuestAgreement(false);
    setIsGuestAgreementOpen(false);
    setIsAgreementScrolledToEnd(false);
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
    if (phone.trim() && !smsOptIn) return "Please confirm SMS consent to provide your phone number.";
    if (guestStep === 0) {
      if (!name.trim() || !email.trim()) return "Please complete your contact details.";
      if (!experiencePreference) return "Please choose your experience preference.";
      return "";
    }
    if (guestStep === 1) {
      return conversationInterest ? "" : "Please choose the conversation that feels most interesting to you.";
    }
    if (mode === "podcast-guest" && !hasAcceptedGuestAgreement) {
      return "Please review and accept the podcast guest agreement before submitting.";
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
      `SMS Opt-In: ${phone.trim() ? (smsOptIn ? "Yes" : "No") : "Not provided"}`,
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
      if (phone.trim() && !smsOptIn) {
        setError("Please confirm SMS consent to provide your phone number.");
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
                  phone,
                  smsOptIn,
                  subject,
                  message: phone.trim()
                    ? `${message}\n\nPhone Number: ${phone}\nSMS Opt-In: ${smsOptIn ? "Yes" : "No"}`
                    : message,
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
                  smsOptIn,
                  preferredDay: preferredDays.join(", "),
                  preferredTime: preferredTimes.join(", "),
                  reasonsForSignup: experiencePreference,
                  reasonsForJoining:
                    conversationInterest || (experiencePreference === "Experience this as a company event" ? experiencePreference : ""),
                  bioAboutMe: `${buildGuestMessage()}\nGuest Agreement Accepted: ${mode === "podcast-guest" ? (hasAcceptedGuestAgreement ? "Yes" : "No") : "Not required"}`,
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

  const handleOpenGuestAgreement = () => {
    setHasOpenedGuestAgreement(true);
    setIsAgreementScrolledToEnd(false);
    setIsGuestAgreementOpen(true);
    setError("");
  };

  const handleAgreementScroll = (event: { currentTarget: HTMLDivElement }) => {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 8;
    if (reachedBottom) {
      setIsAgreementScrolledToEnd(true);
    }
  };

  const handleAcceptGuestAgreement = (checked: boolean) => {
    if (!checked || !isAgreementScrolledToEnd) return;
    setHasAcceptedGuestAgreement(true);
    setIsGuestAgreementOpen(false);
    setError("");
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
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border-[0.75px] border-[#D5C7E2] bg-white text-[10px] font-semibold text-[#7A3168] transition hover:bg-[#F8F3FB]"
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
                  className="inline-flex min-w-28 items-center justify-center rounded-[10px] border-[0.75px] border-[#7A3168] bg-white px-4 py-2 text-sm font-medium text-[#7A3168] transition hover:bg-[#F8F3FB]"
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

                <label className="mt-3 flex items-start gap-3 rounded-[14px] border border-[#D5C7E2] bg-[#F8F3FB] px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(event) => setSmsOptIn(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#7A3168] text-[#7A3168] focus:ring-[#7A3168]"
                  />
                  <span className="text-xs leading-relaxed text-[#4B5563]">{SMS_OPT_IN_COPY}</span>
                </label>

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

                <label className="mt-3 flex items-start gap-3 rounded-[14px] border border-[#D5C7E2] bg-[#F8F3FB] px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(event) => setSmsOptIn(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#7A3168] text-[#7A3168] focus:ring-[#7A3168]"
                  />
                  <span className="text-xs leading-relaxed text-[#4B5563]">{SMS_OPT_IN_COPY}</span>
                </label>

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

                {mode === "podcast-guest" ? (
                  <div className="mt-4 rounded-[14px] border border-[#D5C7E2] bg-[#F8F3FB] px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[0.9rem] font-semibold text-[#231F20]">Required guest agreement</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#4B5563]">
                          Open the agreement, scroll to the bottom, and accept it before submitting this form.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenGuestAgreement}
                        className="inline-flex items-center justify-center rounded-[10px] border-[0.75px] border-[#7A3168] bg-white px-4 py-2 text-sm font-medium text-[#7A3168] transition hover:bg-[#F8F3FB]"
                      >
                        {hasAcceptedGuestAgreement ? "Review agreement" : "Open agreement"}
                      </button>
                    </div>

                    <label className="mt-3 flex items-start gap-3 text-left">
                      <input
                        type="checkbox"
                        checked={hasAcceptedGuestAgreement}
                        readOnly
                        disabled={!hasOpenedGuestAgreement}
                        className="mt-1 h-4 w-4 rounded border border-black bg-white text-black accent-black focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="text-xs leading-relaxed text-[#4B5563]">
                        I have reviewed and accepted the podcast guest agreement.
                      </span>
                    </label>
                  </div>
                ) : null}
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

      {isGuestAgreementOpen ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-[2px]">
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[18px] border border-[#D5C7E2] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[#E8DCE8] px-5 py-4">
              <div className="flex justify-center pb-3">
                <img src={agreementLogoUrl} alt="The Unscripted Room logo" className="h-14 w-auto" />
              </div>
              <h4 className="text-lg font-semibold text-[#231F20]">Podcast guest agreement</h4>
              <p className="mt-1 text-sm text-[#5B6064]">
                Scroll to the bottom of the agreement to enable acceptance.
              </p>
            </div>

            <div className="px-5 py-4">
              {PODCAST_GUEST_CONTRACT_URL ? (
                <div
                  className="max-h-[52vh] overflow-y-auto rounded-[12px] border border-[#D5C7E2] bg-[#FCFAFD]"
                  onScroll={handleAgreementScroll}
                >
                  <iframe
                    title="Podcast guest agreement"
                    src={PODCAST_GUEST_CONTRACT_URL}
                    className="h-[70vh] min-h-[640px] w-full border-0 bg-white"
                  />
                </div>
              ) : (
                <div
                  className="max-h-[52vh] overflow-y-auto rounded-[12px] border border-[#D5C7E2] bg-[#FCFAFD] px-4 py-4"
                  onScroll={handleAgreementScroll}
                >
                  <div className="whitespace-pre-line text-sm leading-relaxed text-[#231F20]">
                    {PODCAST_GUEST_CONTRACT_TEXT}
                  </div>
                </div>
              )}

              <label className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#D5C7E2] bg-[#F8F3FB] px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={hasAcceptedGuestAgreement}
                  disabled={!isAgreementScrolledToEnd}
                  onChange={(event) => handleAcceptGuestAgreement(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border border-black bg-white text-black accent-black focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs leading-relaxed text-[#4B5563]">
                  {isAgreementScrolledToEnd
                    ? "I have reviewed this agreement and agree to these terms."
                    : "Scroll to the bottom of the agreement to enable this confirmation."}
                </span>
              </label>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGuestAgreementOpen(false)}
                  className={secondaryButtonClassName}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
  "inline-flex min-w-32 items-center justify-center rounded-[10px] border-[0.75px] border-[#C8A7C7] bg-white px-5 py-2.5 text-sm font-medium text-[#7A3168] transition hover:bg-[#F8F3FB]";
