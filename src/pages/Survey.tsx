import { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../lib/apiBase";
import { getAuthEmail } from "../lib/auth";

const logoImageUrl = new URL("../assets/UR LOGO dark.png", import.meta.url).href;

type SurveyForm = {
  email: string;
  name: string;
  curiosityImportance: string;
  curiosityReason: string;
  conversationFeel: string;
  standoutMoment: string;
  appreciation: string;
  shift: string;
  connectionLevel: string;
  betterExperience: string;
  attendAgain: string;
  availability: string[];
  anythingElse: string;
};

const initialForm: SurveyForm = {
  email: "",
  name: "",
  curiosityImportance: "",
  curiosityReason: "",
  conversationFeel: "",
  standoutMoment: "",
  appreciation: "",
  shift: "",
  connectionLevel: "",
  betterExperience: "",
  attendAgain: "",
  availability: [],
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
      if (!form.curiosityImportance) {
        throw new Error("Question 1 is required.");
      }
      if (!form.connectionLevel) {
        throw new Error("Question 7 is required.");
      }
      if (!form.attendAgain) {
        throw new Error("Question 9 is required.");
      }
      if (!form.availability.length) {
        throw new Error("Question 10 is required.");
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
                <div className="text-base font-semibold font-montserrat text-black pl-5">
                  Personal Reflection
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">1. How important is curiosity to you? (Scale 1–10)</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("curiosityImportance", value)}
                          className={`h-11 min-w-[2.5rem] rounded-xl border border-black/10 px-4 text-sm font-semibold text-black/70 transition ${
                            form.curiosityImportance === value
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
                    <div className="text-sm font-semibold">2. What made you curious to join The Unscripted Room?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.curiosityReason}
                      onChange={(e) => update("curiosityReason", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">
                  Experience Reflection
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">3. How did the conversation feel for you overall?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.conversationFeel}
                      onChange={(e) => update("conversationFeel", e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">4. What stood out to you during the conversation?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.standoutMoment}
                      onChange={(e) => update("standoutMoment", e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">5. What did you appreciate most about the experience?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.appreciation}
                      onChange={(e) => update("appreciation", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold font-montserrat text-black pl-5">
                  Learning & Connection
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">6. Did anything shift for you during or after the conversation?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.shift}
                      onChange={(e) => update("shift", e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">7. How connected did you feel to the other people in the room? (Scale 1–5)</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("connectionLevel", value)}
                          className={`h-11 min-w-[2.5rem] rounded-xl border border-black/10 px-4 text-sm font-semibold text-black/70 transition ${
                            form.connectionLevel === value
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
                <div className="text-base font-semibold font-montserrat text-black pl-5">
                  Looking Forward
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">8. What, if anything, would make this experience even better?</div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                      rows={4}
                      value={form.betterExperience}
                      onChange={(e) => update("betterExperience", e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <div className="text-sm font-semibold">9. Would you be interested in attending another session?</div>
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
                      10. When would you be most likely to attend another session?
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

              <div className="rounded-2xl bg-white p-5">
                <div className="text-sm font-semibold">Optional: Anything else you’d like us to consider?</div>
                <textarea
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                  rows={4}
                  value={form.anythingElse}
                  onChange={(e) => update("anythingElse", e.target.value)}
                  required
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
