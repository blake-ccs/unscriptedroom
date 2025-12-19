import { Link } from "react-router-dom";

export default function PersonalPerformanceLanding() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Personal Performance</h1>
      <p className="mt-4 text-lg text-mute">
        Build habits, reflect on decisions, and earn Curiosity Coins for micro-wins.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/start" className="btn btn-primary">Try free</Link>
        <Link to="/pricing" className="btn btn-ghost">See pricing</Link>
      </div>
      <div className="card mt-8 p-8">
        <p className="text-sm text-mute">Overview for now — targeted experiences rolling out soon.</p>
      </div>
    </section>
  );
}
