import { useState } from "react";
import { api } from "../../lib/api";
import { saveAuthEmail, saveToken } from "../../lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";

const logoImageUrl = new URL("../../assets/UR LOGO dark.png", import.meta.url).href;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/my";

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveToken(data.access_token);
      saveAuthEmail(email);
      nav(next);
    } catch (e: any) {
      const msg = e?.response?.data?.error || "Invalid credentials";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white p-2 text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
        <Link to="/" className="inline-flex items-center">
          <img src={logoImageUrl} alt="The Unscripted Room logo" className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="text-3xl font-bold">Sign in</h2>

      <form className="card mt-6 space-y-3 p-6" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            className="w-full"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              className="w-full pr-11"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-0 mr-2 rounded-md px-2 text-sm text-mute hover:text-ink"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {err && <div className="rounded-xl2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="text-center text-sm text-mute">
          No account?{" "}
          <Link className="link" to={`/register?next=${encodeURIComponent(next)}`}>
            Create one
          </Link>
        </div>
      </form>
    </section>
  );
}
