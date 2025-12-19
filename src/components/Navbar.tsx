import { Link, useNavigate } from "react-router-dom";
import { useHoverIntent } from "../hooks/useHoverIntent";
import Dropdown from "./Dropdown";
import { isAuthed, clearAuth } from "../lib/auth";

export default function Navbar() {
  const platform = useHoverIntent();
  const services = useHoverIntent();
  const company = useHoverIntent();
  const navigate = useNavigate();
  const authed = isAuthed();

  const NavLink = (p: { to: string; label: string }) => (
    <Link
      to={p.to}
      className="text-sm font-medium text-ink/80 hover:text-ink px-3 py-2 rounded-lg transition-colors"
    >
      {p.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl2 bg-brand-600" />
          <span className="text-lg font-bold tracking-tight">My Curiosity Strategy</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {/* Platform */}
          <div className="relative">
            <button
              onMouseEnter={platform.onEnter}
              onMouseLeave={platform.onLeave}
              className="px-3 py-2 text-sm font-medium text-ink/80 hover:text-ink rounded-lg transition"
            >
              Platform
            </button>
            <Dropdown open={platform.open} onMouseEnter={platform.onEnter} onMouseLeave={platform.onLeave}>
              <div className="p-2">
                <Link to="/platform/team-chemistry" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Team Chemistry</div>
                  <div className="text-xs text-mute">Collaborative game, stats, insights</div>
                </Link>
                <Link to="/platform/personal-performance" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Personal Performance</div>
                  <div className="text-xs text-mute">Overview & coming soon</div>
                </Link>
              </div>
            </Dropdown>
          </div>

          {/* Services */}
          <div className="relative">
            <button
              onMouseEnter={services.onEnter}
              onMouseLeave={services.onLeave}
              className="px-3 py-2 text-sm font-medium text-ink/80 hover:text-ink rounded-lg transition"
            >
              Services
            </button>
            <Dropdown open={services.open} onMouseEnter={services.onEnter} onMouseLeave={services.onLeave}>
              <div className="p-2">
                <Link to="/services/consultation" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Consultation</div>
                  <div className="text-xs text-mute">Request a consultation</div>
                </Link>
                <Link to="/services/live-training" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Live Training</div>
                  <div className="text-xs text-mute">On-site or remote sessions</div>
                </Link>
              </div>
            </Dropdown>
          </div>

          <NavLink to="/pricing" label="Pricing" />

          {/* Company */}
          <div className="relative">
            <button
              onMouseEnter={company.onEnter}
              onMouseLeave={company.onLeave}
              className="px-3 py-2 text-sm font-medium text-ink/80 hover:text-ink rounded-lg transition"
            >
              Company
            </button>
            <Dropdown open={company.open} onMouseEnter={company.onEnter} onMouseLeave={company.onLeave}>
              <div className="p-2">
                <Link to="/company/community" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Community</div>
                  <div className="text-xs text-mute">Join the conversation</div>
                </Link>
                <Link to="/company/podcast" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                  <div className="text-sm font-semibold">Podcast</div>
                  <div className="text-xs text-mute">Hear from teams</div>
                </Link>
              </div>
            </Dropdown>
          </div>

          <NavLink to="/contact" label="Contact" />
        </nav>

        <div className="flex items-center gap-2">
        {authed ? (
            <>
            <Link to="/my" className="btn btn-ghost">My Curiosity Strategy</Link>
            <button
                className="btn btn-primary"
                onClick={() => { clearAuth(); navigate("/login"); }}
            >
                Sign out
            </button>
            </>
        ) : (
            <>
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/register?next=/start" className="btn btn-primary">Try for free</Link>
            </>
        )}
        </div>

      </div>
    </header>
  );
}
