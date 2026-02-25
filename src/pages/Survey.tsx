import { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../lib/apiBase";
import { getAuthEmail } from "../lib/auth";

const logoImageUrl = new URL("../assets/UR LOGO dark.png", import.meta.url).href;

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

export default function Survey() {
  const [form, setForm] = useState<SurveyForm>({ ...initialForm, email: getAuthEmail() || "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof SurveyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAvailability = (value: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter((item) => item !== value)
        : [...prev.availability, value],
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (!form.impactLevel) {
        throw new Error("Question 1 is required.");
      }
      if (!form.honestySpace) {
        throw new Error("Question 2 is required.");
      }
      if (!form.attendAgain) {
        throw new Error("Question 5 is required.");
      }
      if (!form.availability.length) {
        throw new Error("Question 6 is required.");
      }
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error("Failed to submit survey.");
      }
      setSubmitted(true);
    } catch (err: any) {
      const message = err?.message || "We couldn't submit your survey. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f4ece1] px-6 py-10 text-black font-nunito font-semibold">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/90 p-2 text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Back to home"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M15.5 5.5L9 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link to="/" className="flex items-center">
              <img src={logoImageUrl} alt="The Unscripted Room logo" className="h-8 w-auto sm:h-9" />
            </Link>
          </div>
        </header>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold font-montserrat sm:text-3xl">Post-Session Reflection Survey</h1>
        </div>

        <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_20px_50px_rgba(33,24,16,0.12)] sm:px-6 sm:py-5">
          <div className="text-sm text-black/70">
            Thank you for taking the time to reflect. Your perspective helps shape future conversations.
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(33,24,16,0.12)] sm:p-8">

          {submitted ? (
            <div className="mt-10 rounded-2xl border border-black/10 bg-[#f4ece1] p-6">
              <div className="text-lg font-semibold">Thanks for sharing.</div>
              <p className="mt-2 text-sm text-black/70">
                Your reflections were recorded. We appreciate your thoughtfulness.
              </p>
            </div>
          ) : (
            <form className="mt-8 space-y-8" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5">
                  <div className="text-sm font-semibold">Name</div>
                  <input
                    className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <div className="text-sm font-semibold">Email</div>
                  <input
                    className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">Reflection</div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">
                      1. How impactful was this conversation for you? (Scale 1-5)
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("impactLevel", value)}
                          className={`h-11 min-w-[2.5rem] rounded-xl border border-black/10 px-4 text-sm font-semibold text-black/70 transition ${
                            form.impactLevel === value
                              ? "bg-[#6b2a5e] text-white border-[#6b2a5e] shadow-[0_6px_14px_rgba(107,42,94,0.25)]"
                              : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">
                      2. Did the room feel like a space where you could show up honestly? (Scale 1-5)
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("honestySpace", value)}
                          className={`h-11 min-w-[2.5rem] rounded-xl border border-black/10 px-4 text-sm font-semibold text-black/70 transition ${
                            form.honestySpace === value
                              ? "bg-[#6b2a5e] text-white border-[#6b2a5e] shadow-[0_6px_14px_rgba(107,42,94,0.25)]"
                              : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">Reflection</div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">3. What stood out most about the experience? (Optional)</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.standoutMoment}
                      onChange={(e) => update("standoutMoment", e.target.value)}
                    />
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">
                      4. What, if anything, would make the experience even better? (Optional)
                    </div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.betterExperience}
                      onChange={(e) => update("betterExperience", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">
                  Looking Forward
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">5. Would you join another Unscripted Room?</div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {["Yes", "Maybe", "Not right now"].map((value) => (
                        <label key={value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="attendAgain"
                            value={value}
                            checked={form.attendAgain === value}
                            onChange={() => update("attendAgain", value)}
                            className="h-4 w-4 aspect-square appearance-none rounded-full border border-black/20 bg-white checked:border-[#6b2a5e] checked:bg-[#6b2a5e] shrink-0 inline-block align-middle"
                            style={{ borderRadius: "999px" }}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">
                      6. When would you most likely attend another session?
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {[
                        "Weekday mornings",
                        "Weekday afternoons",
                        "Weekday evenings",
                        "Weekend mornings",
                        "Weekend afternoons",
                        "Weekend evenings",
                        "My availability varies",
                        "Not sure yet",
                      ].map((value) => (
                        <label key={value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.availability.includes(value)}
                            onChange={() => toggleAvailability(value)}
                            className="h-4 w-4 aspect-square appearance-none rounded-full border border-black/20 bg-white checked:border-[#6b2a5e] checked:bg-[#6b2a5e] shrink-0 inline-block align-middle"
                            style={{ borderRadius: "999px" }}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">Podcast Invitation</div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">
                      7. Would you be open to participating in a future Unscripted Room podcast conversation?
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {["Yes", "Maybe", "Not at this time"].map((value) => (
                        <label key={value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="podcastInterest"
                            value={value}
                            checked={form.podcastInterest === value}
                            onChange={() => update("podcastInterest", value)}
                            className="h-4 w-4 aspect-square appearance-none rounded-full border border-black/20 bg-white checked:border-[#6b2a5e] checked:bg-[#6b2a5e] shrink-0 inline-block align-middle"
                            style={{ borderRadius: "999px" }}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <div className="text-sm font-semibold">Optional: Is there anything else you’d like to share?</div>
                <textarea
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                  rows={4}
                  value={form.anythingElse}
                  onChange={(e) => update("anythingElse", e.target.value)}
                />
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <button
                type="submit"
                className="w-full rounded-full bg-[#6b2a5e] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
