import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import API_BASE from "../lib/apiBase";
import { openCalendlyPopup } from "../lib/calendly";

type RegisterInterestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RegisterInterestModal({ isOpen, onClose }: RegisterInterestModalProps) {
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
  const [curiosityValue, setCuriosityValue] = useState(5);

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
    if (!isSubmitted) {
      setShowThanks(false);
      return;
    }
    const id = requestAnimationFrame(() => setShowThanks(true));
    return () => cancelAnimationFrame(id);
  }, [isSubmitted]);

  const firstName = (nameValue ?? "").trim().split(/\s+/)[0] || "friend";
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
    setCuriosityValue(5);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 transition opacity-100"
      aria-hidden={!isOpen}
    >
      <style>{`
        .custom-check,
        .custom-radio {
          -webkit-appearance: none;
          appearance: none;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          max-width: 16px;
          max-height: 16px;
          padding: 0;
          margin: 0;
          line-height: 0;
        }
        .custom-check {
          border-radius: 2px;
        }
        .custom-check:checked::after {
          content: "";
          position: absolute;
          left: 4px;
          top: 1px;
          width: 6px;
          height: 10px;
          border: 2px solid #000000;
          border-top: 0;
          border-left: 0;
          transform: rotate(45deg);
        }
        .custom-radio {
          border-radius: 9999px;
        }
        .custom-radio:checked::after {
          content: "";
          position: absolute;
          inset: 3px;
          background: #000000;
          border-radius: 9999px;
        }
        .range-track {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        .range-track::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
        .range-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          background: #000000;
          border-radius: 9999px;
          margin-top: -7px;
        }
        .range-track::-moz-range-track {
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
        .range-track::-moz-range-thumb {
          height: 18px;
          width: 18px;
          background: #000000;
          border: none;
          border-radius: 9999px;
        }
      `}</style>
      <div className="absolute inset-0 bg-black/40 transition" onClick={onClose} />
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-[#fbf7f1] shadow-2xl transition"
        role="dialog"
        aria-modal="true"
        aria-label="Unscripted Room Registration"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div className="text-lg font-semibold text-black">Reserve a Seat</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ece1] text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:shadow"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ece1] text-2xl">
              ✓
            </div>
            <h4 className="mt-6 text-2xl font-semibold text-black">Thank you, {firstName}.</h4>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/70">
              We&apos;re grateful you&apos;re interested in The Unscripted Room. We&apos;ll be in touch soon with
              next steps and an invitation.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => openCalendlyPopup()}
                className="rounded-full bg-[#f4ece1] px-6 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Reserve a Seat
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsSubmitted(false);
                  resetFormState();
                }}
                className="rounded-full border border-black/10 bg-white px-6 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-xs text-black/60">
              By continuing, you agree to our <a className="underline" href="/terms">Terms</a> and{" "}
              <a className="underline" href="/privacy">Privacy Policy</a>.
            </p>
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
                const response = await fetch(`${API_BASE}/api/register`, {
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
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">Your Details</div>
            <div className="mt-3 grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/80">Name</label>
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
                <label className="text-sm font-medium text-black/80">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                  required
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <input id="age-check" name="ageConfirmed" type="checkbox" className="custom-check" required />
              <label htmlFor="age-check" className="text-sm">
                Are you 18 years of age or older?
              </label>
            </div>

            <div className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
              Availability Questions
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <label className="text-sm font-medium text-black/80">
                What days of the week work best for you?
              </label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="custom-check"
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
                      className="custom-check"
                      checked={selectedTimes.includes(label)}
                      onChange={() => toggleSelection(label, selectedTimes, setSelectedTimes)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {timesError && <div className="text-xs font-medium text-red-600">{timesError}</div>}
            </div>

            <div className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
              Personal Questions
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <label className="text-sm font-medium text-black/80">
                How important is curiosity to you? (Scale 1-10)
              </label>
              <div className="flex flex-col gap-2">
                <div className="text-center text-sm font-semibold text-black/70">{curiosityValue}</div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-black/60">1</span>
                  <input
                    type="range"
                    name="curiosityLevel"
                    min={1}
                    max={10}
                    defaultValue={5}
                    value={curiosityValue}
                    onChange={(event) => setCuriosityValue(Number(event.target.value))}
                    className="range-track w-full flex-1 min-w-0 p-0 border-0 focus:outline-none focus:ring-0"
                    required
                  />
                  <span className="text-xs text-black/60">10</span>
                </div>
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
                      className="custom-radio"
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
              <input id="updates-check" name="updatesOptIn" type="checkbox" className="custom-check" />
              <label htmlFor="updates-check" className="text-sm">
                I would like to receive future updates (optional)
              </label>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-[#f4ece1] px-6 py-3 text-sm font-semibold text-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
            <p className="mt-4 text-xs text-black/60">
              By submitting, you agree to our <a className="underline" href="/terms">Terms</a> and{" "}
              <a className="underline" href="/privacy">Privacy Policy</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
