import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

// Catch-all so unknown URLs render inside the normal site layout (and hydrate cleanly
// from the SPA shell Netlify serves with a 404 status).
export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found | The Unscripted Room" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <section className="paper-texture section-pad min-h-[60svh]">
      <div className="site-container max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-5">Page not found</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="apply">
            <Link to="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/watch">Watch an episode</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
