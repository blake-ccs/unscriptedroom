// "From the other side of the table": hidden until real, approved guest quotes exist.
// To publish: add entries to `guestTestimonials` and set SHOW_TESTIMONIALS to true.
// Only use real quotes approved by the guest, and candid photos from their own recording.

export type GuestTestimonial = {
  quote: string;
  name: string; // first name only, as approved by the guest
  role: string; // e.g. "Season One Guest"
  photo?: string; // import from @/assets; square crop, shown at 56px
};

export const SHOW_TESTIMONIALS = false;

export const guestTestimonials: GuestTestimonial[] = [];

export function Testimonials() {
  if (!SHOW_TESTIMONIALS || guestTestimonials.length === 0) return null;
  return (
    <section className="py-16 sm:py-24" aria-labelledby="from-the-table-heading">
      <div className="site-container">
        <h2 id="from-the-table-heading">From the other side of the table.</h2>
        <div className="mt-12 grid gap-x-12 gap-y-12 md:grid-cols-3">
          {guestTestimonials.map((t) => (
            <figure key={t.quote}>
              <blockquote className="text-xl font-medium leading-snug text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-4 text-sm">
                {t.photo && (
                  <img
                    src={t.photo}
                    alt=""
                    loading="lazy"
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                )}
                <span>
                  <span className="block font-semibold text-foreground">{t.name}</span>
                  <span className="block text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
