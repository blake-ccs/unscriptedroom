import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getPendingPurchase, clearPendingPurchase, setActiveTeamId } from "../lib/flow";

export default function Start() {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if no pending purchase, default to Team Chemistry
    const pp = getPendingPurchase();
    if (!pp.length) {
      localStorage.setItem("pending_purchase", JSON.stringify(["PRICE_TEAM_CHEMISTRY"]));
    }
  }, []);

  async function createTeamAndCheckout() {
    setError(null); setLoading(true);
    try {
      // 1) Create team (or reuse first team)
      const myTeams = await api.get("/teams/my").then(r => r.data as any[]);
      let teamId: number | null = myTeams?.[0]?.id ?? null;
      if (!teamId) {
        if (!teamName.trim()) { setError("Please enter a team name"); setLoading(false); return; }
        const t = await api.post("/teams", { name: teamName.trim() }).then(r => r.data);
        teamId = t.id;
      }
      setActiveTeamId(teamId!);

      // 2) Resolve price IDs from env (front-end) and call checkout
      const pendingKeys = getPendingPurchase();
      const priceIds = pendingKeys
        .map(k => (import.meta.env[`VITE_${k}`] as string | undefined))
        .filter(Boolean) as string[];

      const payload = priceIds.length ? { team_id: teamId, price_ids: priceIds } : { team_id: teamId };
      const { data } = await api.post("/checkout/session", payload);
      clearPendingPurchase();

      // 3) Redirect to Stripe
      window.location.href = data.url;
    } catch (e:any) {
      setError(e?.response?.data?.error || "Checkout failed. Are you signed in?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h2 className="text-3xl font-bold">Set up your team</h2>
      <p className="mt-2 text-mute text-sm">Name your team to start your free trial. You can change this later.</p>

      <div className="card mt-6 p-6 space-y-3">
        <input
          className="w-full"
          placeholder="Team name (e.g., Product Squad A)"
          value={teamName}
          onChange={(e)=>setTeamName(e.target.value)}
        />
        <button className="btn btn-primary w-full" onClick={createTeamAndCheckout} disabled={loading}>
          {loading ? "Preparing checkout..." : "Continue to Stripe"}
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      <p className="mt-3 text-xs text-mute">By continuing you agree to the Terms and Privacy Policy.</p>
    </section>
  );
}
