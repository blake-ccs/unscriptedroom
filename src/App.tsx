import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PodcastLanding from "./pages/PodcastLanding";
import About from "./pages/About";
import Why from "./pages/Why";
import Episodes from "./pages/Episodes";
import Player from "./pages/Player";

// LANDERS
import TeamChemistryLanding from "./pages/platform/TeamChemistryLanding";
import PersonalPerformanceLanding from "./pages/platform/PersonalPerformanceLanding";
import ServicesConsultation from "./pages/services/Consultation";
import ServicesLiveTraining from "./pages/services/LiveTraining";
import Pricing from "./pages/Pricing";
import CompanyCommunity from "./pages/company/Community";
import CompanyPodcast from "./pages/company/Podcast";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RegisterInterest from "./pages/RegisterInterest";
import QuickLanding from "./pages/QuickLanding";
import ContactUs from "./pages/ContactUs";
import Survey from "./pages/Survey";

// AUTH & ACCOUNT
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import My from "./pages/My";
import Start from "./pages/Start";
import AcceptInvite from "./pages/auth/AcceptInvite";
import ClaimInvite from "./pages/auth/ClaimInvite";
import InviteTeammates from "./pages/app/TeamChemistry/InviteTeammates";

// APP (gated UIs)
import TeamChemistry from "./pages/app/TeamChemistry"

import Success from "./pages/Success";

import { isAuthed } from "./lib/auth";

function Protected({ children }: { children: JSX.Element }) {
  const location = useLocation();
  return isAuthed()
    ? children
    : <Navigate to={`/register?next=${encodeURIComponent(location.pathname)}`} replace />;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const frame = window.requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ block: "start", inline: "nearest" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/podcast" element={<PodcastLanding />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/player" element={<Player />} />
          <Route path="/why" element={<Why />} />

          {/* Landers (always public) */}
          <Route path="/platform/team-chemistry" element={<TeamChemistryLanding />} />
          <Route path="/platform/personal-performance" element={<PersonalPerformanceLanding />} />
          <Route path="/services/consultation" element={<ServicesConsultation />} />
          <Route path="/services/live-training" element={<ServicesLiveTraining />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/company/community" element={<CompanyCommunity />} />
          <Route path="/community" element={<CompanyCommunity />} />
          <Route path="/company/podcast" element={<CompanyPodcast />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register-interest" element={<RegisterInterest />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/qr" element={<QuickLanding />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/survey" element={<Survey />} />

          {/* Auth & account */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my" element={<Protected><My /></Protected>} />
          <Route path="/invite/accept" element={<AcceptInvite />} />
          <Route path="/invite/claim" element={<ClaimInvite />} />
          <Route path="/app/invite" element={<InviteTeammates />} />

          {/* Start wizard for team + checkout */}
          <Route path="/start" element={<Protected><Start /></Protected>} />

          {/* Gated product UIs */}
          <Route path="/app/*" element={<TeamChemistry />} />

          <Route path="/success" element={<Success />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
