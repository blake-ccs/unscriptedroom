import { Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";

// LANDERS
import TeamChemistryLanding from "./pages/platform/TeamChemistryLanding";
import PersonalPerformanceLanding from "./pages/platform/PersonalPerformanceLanding";
import ServicesConsultation from "./pages/services/Consultation";
import ServicesLiveTraining from "./pages/services/LiveTraining";
import Pricing from "./pages/Pricing";
import CompanyCommunity from "./pages/company/Community";
import CompanyPodcast from "./pages/company/Podcast";
import Contact from "./pages/Contact";

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
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Landers (always public) */}
          <Route path="/platform/team-chemistry" element={<TeamChemistryLanding />} />
          <Route path="/platform/personal-performance" element={<PersonalPerformanceLanding />} />
          <Route path="/services/consultation" element={<ServicesConsultation />} />
          <Route path="/services/live-training" element={<ServicesLiveTraining />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/company/community" element={<CompanyCommunity />} />
          <Route path="/company/podcast" element={<CompanyPodcast />} />
          <Route path="/contact" element={<Contact />} />

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
