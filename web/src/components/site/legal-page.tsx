import type { ReactNode } from "react";

export function LegalPage({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: ReactNode;
}) {
  return (
    <section className="paper-texture section-pad">
      <div className="site-container max-w-3xl">
        <p className="eyebrow">CCS</p>
        <h1 className="mt-3 text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Effective date: {effective}</p>
        <div className="legal-copy mt-10 space-y-8 text-muted-foreground [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:mt-2 [&_p+p]:mt-3 [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </section>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2>{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
