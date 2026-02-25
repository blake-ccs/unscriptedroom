import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink/80"
          aria-label="Back to home"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">CCS</p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-mute">Effective date: February 6, 2026</p>
        </div>

        <div className="space-y-4 text-sm text-ink/80">
          <p>
            CCS (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This policy explains how
            we collect, use, and share information when you visit our websites, submit forms, or interact with our
            services.
          </p>
          <div>
            <h2 className="text-base font-semibold text-ink">Information we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Contact details (name, email, phone) you provide.</li>
              <li>Form responses and preferences (e.g., availability, interests).</li>
              <li>Technical data (IP address, browser, device, pages viewed).</li>
              <li>Scheduling data from Calendly (event details, time, location).</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">How we use information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To respond to requests, deliver services, and schedule sessions.</li>
              <li>To send transactional and marketing communications.</li>
              <li>To improve our websites, programs, and customer experience.</li>
              <li>To comply with legal obligations and protect our rights.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Messaging (email & SMS)</h2>
            <p className="mt-2">
              By providing your contact information, you consent to receive communications from CCS. You may receive
              email and/or SMS messages about scheduling, updates, and offers. Message frequency varies. Message and data
              rates may apply. Consent is not a condition of purchase.
            </p>
            <p className="mt-2">
              To opt out of SMS, reply <strong>STOP</strong> at any time. For help, reply <strong>HELP</strong>. To
              unsubscribe from emails, use the unsubscribe link in any email.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Sharing</h2>
            <p className="mt-2">
              We share information with trusted service providers (e.g., email, CRM, scheduling) to operate our services.
              We do not sell your personal information.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Data retention</h2>
            <p className="mt-2">
              We retain information as needed to provide services, comply with obligations, and resolve disputes.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Your choices</h2>
            <p className="mt-2">
              You may request access, correction, or deletion of your information by contacting us.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Contact</h2>
            <p className="mt-2">
              Questions? Contact us at <Link className="link" to="/contact">/contact</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
