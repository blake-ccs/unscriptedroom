import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Retired from the homepage (Oct 2026 creative review). Kept for possible future use; not rendered.
// Original "Every conversation starts with why" block with the ghosted "SEASON 02" type.
export function SeasonTwoIntro() {
  return (
    <section className="paper-texture groove-light relative overflow-hidden pt-[clamp(4.5rem,9vw,9rem)] pb-[clamp(2.5rem,5vw,5rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-4 select-none whitespace-nowrap text-center font-display text-[24vw] leading-none text-foreground/[.045]"
      >
        SEASON 02
      </div>
      <div className="site-container relative">
        <div className="max-w-3xl">
          <p className="rule-label text-purple">Season Two · Coming soon</p>
          <h2 className="display-statement mt-6">Every conversation starts with why.</h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            New conversations. New perspectives. More reasons to take a seat at the table.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="apply" size="lg">
              <Link to="/season-two">
                Explore Season Two <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/join-a-conversation">
                Be on the Podcast <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
