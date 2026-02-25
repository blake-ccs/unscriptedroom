import { useState } from "react";
import { motion } from "framer-motion";
import API_BASE from "../lib/apiBase";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please complete all fields.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden px-6 py-20">
      {/* Gradient orbs background */}
      <motion.div
        className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl"
        animate={{ x: [0, 20, -15, 0], y: [0, -10, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl"
        animate={{ x: [0, -25, 20, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="mt-3 text-mute">We’ll respond within 1–2 business days.</p>
      </div>

      <div className="relative z-10 mt-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white/60 p-8 shadow-lg backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <FloatingInput
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <FloatingInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <FloatingInput
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
            <FloatingTextarea
              label="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <motion.button
              type="submit"
              disabled={sending || sent}
              whileTap={{ scale: 0.98 }}
              className={`btn btn-primary w-fit ${
                sent ? "bg-green-600 hover:bg-green-600" : ""
              }`}
            >
              {sending ? "Sending..." : sent ? "Sent ✓" : "Send Message"}
            </motion.button>
          </form>
        </div>

        {/* Optional small contact info */}
        <div className="mt-10 text-center text-sm text-mute">
          Or reach us directly:{" "}
          <a href="mailto:info@curiositystrategy.com" className="link">
            info@curiositystrategy.com
          </a>
          <br />
          <span className="text-xs">Mon–Fri, 9am–5pm EST</span>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Floating Input Components ───────────────────────────── */
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const active = value.length > 0;
  return (
    <label className="relative block">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full rounded-xl2 border border-gray-300 bg-white px-3 pb-2 pt-5 text-sm text-gray-900 placeholder-transparent outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
      <span
        className={`absolute left-3 top-2.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base ${
          active ? "text-xs text-brand-700 top-1.5" : ""
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function FloatingTextarea({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}) {
  const active = value.length > 0;
  return (
    <label className="relative block">
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        rows={4}
        className="peer w-full resize-none rounded-xl2 border border-gray-300 bg-white px-3 pb-2 pt-5 text-sm text-gray-900 placeholder-transparent outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
      <span
        className={`absolute left-3 top-2.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base ${
          active ? "text-xs text-brand-700 top-1.5" : ""
        }`}
      >
        {label}
      </span>
    </label>
  );
}
