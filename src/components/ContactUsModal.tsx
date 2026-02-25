import { useEffect, useState } from "react";
import API_BASE from "../lib/apiBase";

type ContactUsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    if (isOpen) {
      setIsSubmitted(false);
      setIsSubmitting(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 transition" aria-hidden={!isOpen}>
      <div className="absolute inset-0 bg-black/40 transition" onClick={onClose} />
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-[#fbf7f1] shadow-2xl transition"
        role="dialog"
        aria-modal="true"
        aria-label="Contact Us"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div className="text-lg font-semibold text-black">Contact Us</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ece1] text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:shadow"
            aria-label="Close contact form"
          >
            X
          </button>
        </div>

        {isSubmitted ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ece1] text-2xl">
              ✓
            </div>
            <h4 className="mt-6 text-2xl font-semibold text-black">Message sent.</h4>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/70">
              Thanks for reaching out. We&apos;ll be in touch soon.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
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
              setError("");
              setIsSubmitting(true);
              try {
                const response = await fetch(`${API_BASE}/api/contact`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    email,
                    subject: topic,
                    message,
                  }),
                });
                if (!response.ok) throw new Error("Request failed");
                setIsSubmitted(true);
              } catch {
                setError("We couldn’t send your message just now. Please try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">Choose a topic</div>
            <div className="mt-3 grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/80">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/80">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                  required
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-black/80">Choose a topic</label>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                required
              >
                <option value="" disabled>
                  Choose a topic
                </option>
                <option>I’d like to be a podcast guest</option>
                <option>I have a question about The Unscripted Room</option>
                <option>I’m interested in attending a session</option>
                <option>I’d like to bring The Unscripted Room to my organization or community</option>
                <option>Something else</option>
              </select>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-black/80">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[140px] rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                required
              />
            </div>

            {error && <div className="mt-5 text-sm font-medium text-red-600">{error}</div>}

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-[#f4ece1] px-6 py-3 text-sm font-semibold text-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
