import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Guest Portal | The Unscripted Room" },
      { name: "description", content: "A private space for confirmed guests is coming soon." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <section className="dark-band grid min-h-[70svh] place-items-center py-16">
      <div className="site-container">
        <div className="paper-card mx-auto max-w-md p-8">
          <span className="tag tag-topic">Coming soon</span>
          <Mic2 className="mt-8 h-8 w-8 text-purple" />
          <h1 className="mt-5 text-4xl">Guest Portal</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A private space for confirmed guests to complete intake and review recording details is
            on its way. Until then, the team will reach out to confirmed guests directly by email.
          </p>
          <Button asChild variant="apply" size="lg" className="mt-8 w-full">
            <Link to="/join-a-conversation">What taking part is like</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
