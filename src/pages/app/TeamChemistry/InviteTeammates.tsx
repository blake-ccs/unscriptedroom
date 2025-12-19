// curiosity-web/src/pages/app/TeamChemistry/InviteTeammates.tsx
import { useState } from "react";
import { createTeamInvites } from "../../../lib/invites";

export default function InviteTeammates() {
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [links, setLinks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onInvite() {
    setMsg(""); setLinks([]); setBusy(true);
    const emails = raw.split(/[\n,;\s]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      setMsg("Enter at least one email.");
      setBusy(false);
      return;
    }
    try {
      const res = await createTeamInvites(emails);
      // If your API returns invite links:
      if (res?.links && Array.isArray(res.links)) setLinks(res.links);
      setMsg(res?.message || `Invites created for ${emails.length} recipient(s).`);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e?.message || "Failed to create invites");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Invite teammates</h2>
      <p className="text-sm opacity-80">Paste emails separated by comma/newline.</p>
      <textarea
        className="w-full h-32 p-3 rounded-xl bg-neutral-900/40 border border-neutral-700"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        placeholder="user1@acme.com\nuser2@acme.com"
      />
      <button
        onClick={onInvite}
        disabled={busy}
        className="px-4 py-2 rounded-2xl shadow bg-white text-black hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send invites"}
      </button>
      {msg && <div className="text-sm opacity-80">{msg}</div>}
      {links.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Share these links</h3>
          <ul className="space-y-1">
            {links.map((l, i) => (
              <li key={i} className="flex items-center gap-2">
                <input readOnly value={l} className="flex-1 p-2 rounded bg-neutral-900/40 border border-neutral-700" />
                <button onClick={() => navigator.clipboard.writeText(l)} className="px-3 py-2 rounded bg-neutral-800">Copy</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
