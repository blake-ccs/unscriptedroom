import { Link } from "@tanstack/react-router";
import { Instagram, Menu, Music2, Youtube } from "lucide-react";
import logoFooter from "@/assets/logo-footer.png";
import micCream from "@/assets/mic-cream.png";
import { Button } from "@/components/ui/button";
import { SeasonTwoInvite } from "@/components/site/season-two-invite";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const playlist = "https://www.youtube.com/playlist?list=OLFuQWeBrfBe0nnsvOBj4GDE5jYCKscX_jw";
const primaryLinks = [
  ["Home", "/"],
  ["Watch", "/watch"],
  ["About", "/about"],
  ["FAQ", "/faq"],
] as const;
const footerLinks = [
  ["Watch", "/watch"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Join a Conversation", "/join-a-conversation"],
  ["Apply", "/apply"],
  ["Contact", "/contact"],
  ["Season Two", "/season-two"],
  ["Privacy Policy", "/privacy"],
  ["Terms", "/terms"],
] as const;
// Header wordmark: the "Subscribe and keep listening." headline font, set in title case.
// The footer keeps the official logo (BrandLogo); the two treatments are intentionally different.
const wordmarkClass =
  "whitespace-nowrap font-headline text-[1.3rem] font-semibold uppercase leading-none tracking-[.04em] text-warm-white sm:text-[1.55rem]";
export function Brand() {
  return (
    <Link
      to="/"
      className={`flex min-w-0 items-center gap-3 justify-self-start ${wordmarkClass}`}
      aria-label="The Unscripted Room home"
    >
      <img src={micCream} alt="" className="h-7 w-auto shrink-0" />
      The Unscripted Room
    </Link>
  );
}
export function BrandLogo() {
  return (
    <Link to="/" aria-label="The Unscripted Room home">
      <img src={logoFooter} alt="The Unscripted Room Podcast" className="h-40 w-auto" />
    </Link>
  );
}
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-warm-white/15 bg-ink/95 backdrop-blur">
      <div className="site-container grid h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Brand />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {primaryLinks.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="nav-link"
              activeProps={{ className: "nav-link nav-link-active" }}
            >
              {label}
            </Link>
          ))}
          <Button asChild variant="apply">
            <Link to="/join-a-conversation">Be on the Podcast</Link>
          </Button>
        </nav>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="darkGhost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-warm-white/20 bg-ink text-warm-white">
              <SheetTitle className={`flex items-center gap-3 ${wordmarkClass}`}>
                <img src={micCream} alt="" className="h-7 w-auto shrink-0" />
                The Unscripted Room
              </SheetTitle>
              <nav className="mt-10 flex flex-col" aria-label="Mobile navigation">
                {primaryLinks.map(([label, to]) => (
                  <SheetClose asChild key={to}>
                    <Link
                      to={to}
                      className="border-b border-warm-white/15 py-4 font-bold uppercase"
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    to="/join-a-conversation"
                    className="mt-5 bg-chartreuse px-5 py-4 text-center text-xs font-headline font-semibold tracking-[.1em] uppercase text-ink transition-colors hover:bg-purple hover:text-warm-white"
                  >
                    Be on the Podcast
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="tactile bg-ink text-warm-white">
      <div className="site-container relative z-10 py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <BrandLogo />
            <p className="mt-5 max-w-md text-sm text-warm-white/60">
              Long-form conversations from a real room in Amesbury, Massachusetts.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/theunscriptedroom/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="social-icon"
              >
                <Instagram />
              </a>
              <a
                href="https://www.tiktok.com/@theunscriptedroom"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="social-icon"
              >
                <Music2 />
              </a>
              <a
                href={playlist}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="social-icon"
              >
                <Youtube />
              </a>
            </div>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3"
            aria-label="Footer navigation"
          >
            {footerLinks.map(([label, to]) => (
              <Link key={to} to={to} className="footer-link">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 border-t border-warm-white/10 pt-6 text-xs text-warm-white/60">
          © 2026 The Unscripted Room · Amesbury, Massachusetts
        </div>
      </div>
    </footer>
  );
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <SeasonTwoInvite />
    </>
  );
}
