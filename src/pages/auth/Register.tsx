import { useState } from "react";
import { api } from "../../lib/api";
import { saveToken } from "../../lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [given, setGiven] = useState("");
  const [family, setFamily] = useState("");
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
      const { data } = await api.post("/auth/register", {
        email,
        password,
        given_name: given,
        family_name: family
      });
      saveToken(data.access_token);
      nav(next);
    } catch (e: any) {
      const msg = e?.response?.data?.error || "Registration failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h2 className="text-3xl font-bold">Create your account</h2>
      <p className="mt-2 text-sm text-mute">Start your free trial in under a minute.</p>

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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">First name</label>
            <input
              className="w-full"
              placeholder="Alex"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last name</label>
            <input
              className="w-full"
              placeholder="Morgan"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              className="w-full pr-11"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
          <p className="mt-1 text-xs text-mute">At least 6 characters.</p>
        </div>

        {err && <div className="rounded-xl2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className="text-center text-sm text-mute">
          Already have an account?{" "}
          <Link className="link" to={`/login?next=${encodeURIComponent(next)}`}>
            Sign in
          </Link>
        </div>
      </form>
    </section>
  );
}
