// curiosity-web/src/pages/auth/ClaimInvite.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptInviteToken } from "../../lib/invites";

function isAuthed() { return !!localStorage.getItem("access_token"); }

export default function ClaimInvite() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Claiming invitation…");

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("pending_invite_token");
      if (!token) { setMsg("No invite token found."); return; }
      if (!isAuthed()) { nav("/login?next=%2Finvite%2Fclaim"); return; }
      try {
        await acceptInviteToken(token);
        localStorage.removeItem("pending_invite_token");
        setMsg("Invitation accepted. You are now on the team.");
        setTimeout(() => nav("/app"), 800);
      } catch (e: any) {
        setMsg(e?.response?.data?.error || e?.message || "Failed to accept invitation");
      }
    })();
  }, [nav]);

  return <div className="p-6">{msg}</div>;
}
