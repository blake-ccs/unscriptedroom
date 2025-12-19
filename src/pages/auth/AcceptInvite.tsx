// curiosity-web/src/pages/auth/AcceptInvite.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { setValid(false); return; }
    // Defer validation to server at accept time; just stash the token.
    localStorage.setItem("pending_invite_token", token);
    setValid(true);
  }, [token]);

  if (valid === null) return <div className="p-6">Loading…</div>;
  if (valid === false) return <div className="p-6">Invalid invite link.</div>;

  return (
    <div className="p-6 space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold">You’ve been invited</h1>
      <p>Continue to sign up or sign in to accept your team invitation.</p>
      <div className="flex gap-2">
        <button onClick={() => navigate("/register?next=%2Finvite%2Fclaim")} className="px-4 py-2 rounded-2xl shadow bg-white text-black hover:opacity-90">Register</button>
        <button onClick={() => navigate("/login?next=%2Finvite%2Fclaim")} className="px-4 py-2 rounded-2xl shadow bg-white text-black hover:opacity-90">Sign in</button>
      </div>
    </div>
  );
}
