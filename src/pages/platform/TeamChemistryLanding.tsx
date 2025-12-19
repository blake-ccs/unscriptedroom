import { Link } from "react-router-dom";

export default function TeamChemistryLanding() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Team Chemistry</h1>
          <p className="mt-4 text-lg text-mute">
            A multiplayer experience that trains trust, communication, and problem-solving.
            Measure real interactions and turn them into insights.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/start" className="btn btn-primary">Try free</Link>
            <Link to="/pricing" className="btn btn-ghost">See pricing</Link>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-ink/80">
            <li>• Frictionless lobbies for your team</li>
            <li>• Conversation tracking for game + debrief</li>
            <li>• Leaderboards & Curiosity Coins</li>
          </ul>
        </div>
        <div className="card p-8">
          <div className="aspect-[16/10] w-full rounded-xl2 bg-gradient-to-br from-brand-100 to-white" />
          <p className="mt-4 text-sm text-mute">Gameplay footage coming soon.</p>
        </div>
      </div>
    </section>
  );
}
