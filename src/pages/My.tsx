import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { getActiveTeamId, setActiveTeamId } from "../lib/flow";

export default function My() {
  const [me, setMe] = useState<any>(null);
  const [subs, setSubs] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<number | null>(getActiveTeamId());

  useEffect(() => {
    (async () => {
      try {
        const m = await api.get("/auth/me").then(r => r.data);
        setMe(m);
        const s = await api.get("/subscription").then(r => r.data);
        setSubs(s);
        const t = await api.get("/teams/my").then(r => r.data);
        setTeams(t);
        if (!activeTeam && t?.[0]?.id) {
          setActiveTeam(t[0].id);
          setActiveTeamId(t[0].id);
        }
      } catch {}
    })();
  }, []);

  const ent = subs?.entitlements || {};
  const owned = [
    ent.has_team_chemistry && { label: "Team Chemistry", path: "/app/team-chemistry" },
    ent.has_personal_performance && { label: "Personal Performance", path: "/platform/personal-performance" },
    ent.has_live_training && { label: "Live Training", path: "/services/live-training" }
  ].filter(Boolean) as {label:string; path:string}[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-2xl font-bold">Welcome{me?.given_name ? `, ${me.given_name}` : ""}</h2>
          <p className="mt-1 text-sm text-mute">Your products & teams</p>

          <div className="mt-6 grid gap-4">
            {owned.length ? owned.map((p) => (
              <div key={p.label} className="rounded-xl2 border border-brand-200 bg-brand-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="text-xs text-mute">Included in your plan</div>
                  </div>
                  <Link to={p.path} className="btn btn-primary">Open</Link>
                </div>
              </div>
            )) : (
              <div className="rounded-xl2 border border-gray-200 bg-white p-4 text-sm">
                You don’t have any products yet. The website has details — head to <Link className="link" to="/pricing">Pricing</Link>.
              </div>
            )}
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold">Your teams</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {teams.map((t) => {
                const isActive = activeTeam === t.id;
                return (
                  <div key={t.id} className="rounded-xl2 border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-mute">Role: {t.role}</div>
                        {isActive && <span className="mt-1 inline-block rounded-md bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Active</span>}
                      </div>
                      {!isActive && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => { setActiveTeamId(t.id); setActiveTeam(t.id); }}
                        >
                          Make active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!teams.length && <div className="text-sm text-mute">No teams yet — create one from Pricing → Start.</div>}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="sticky top-24 h-fit space-y-4">
          <div className="card p-4">
            <div className="text-sm font-semibold">My Curiosity Strategy</div>
            <ul className="mt-2 space-y-2 text-sm">
              {ent.has_team_chemistry && <li><Link className="link" to="/app/team-chemistry">Team Chemistry</Link></li>}
              {ent.has_personal_performance && <li><Link className="link" to="/platform/personal-performance">Personal Performance</Link></li>}
              {ent.has_live_training && <li><Link className="link" to="/services/live-training">Live Training</Link></li>}
              {!ent.has_team_chemistry && !ent.has_personal_performance && !ent.has_live_training && (
                <li className="text-mute">No products yet.</li>
              )}
            </ul>
          </div>
          <div className="card p-4">
            <div className="text-sm font-semibold">Billing</div>
            <p className="mt-1 text-xs text-mute">Manage your subscription</p>
            <a className="btn btn-ghost mt-3" href="#" onClick={async (e)=>{e.preventDefault(); try {
              const { data } = await api.post("/portal/session");
              window.location.href = data.url;
            } catch { alert("No customer yet. Buy a plan first."); }}}>Open portal</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
