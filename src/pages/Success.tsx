import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const [status, setStatus] = useState("Syncing your subscription…");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await api.post("/subscription/sync");
        setStatus("All set! Redirecting…");
        setTimeout(() => nav("/my"), 800);
      } catch {
        setStatus("We couldn't verify your subscription automatically. You can continue to My page.");
      }
    })();
  }, [nav]);

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <h2 className="text-3xl font-bold">Thanks!</h2>
      <p className="mt-2 text-mute">{status}</p>
      <div className="mt-6">
        <button className="btn btn-primary" onClick={() => nav("/my")}>Go to My Curiosity Strategy</button>
      </div>
    </section>
  );
}
