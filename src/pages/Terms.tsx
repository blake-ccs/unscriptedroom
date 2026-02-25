import { Link } from "react-router-dom";

export default function Terms() {
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
          <h1 className="text-3xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-sm text-mute">Effective date: February 6, 2026</p>
        </div>

        <div className="space-y-4 text-sm text-ink/80">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of CCS websites, services, and communications. By
            accessing or using our services, you agree to these Terms.
          </p>
          <div>
            <h2 className="text-base font-semibold text-ink">Use of services</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You agree to provide accurate information and keep it up to date.</li>
              <li>You will not misuse the services or attempt unauthorized access.</li>
              <li>We may update or discontinue services at any time.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Scheduling and communications</h2>
            <p className="mt-2">
              By submitting forms or scheduling a session, you authorize CCS to contact you via email and SMS for
              scheduling, updates, and related communications. Message frequency varies. Message and data rates may
              apply. Consent is not a condition of purchase.
            </p>
            <p className="mt-2">
              To opt out of SMS, reply <strong>STOP</strong>. For help, reply <strong>HELP</strong>. To unsubscribe from
              emails, use the unsubscribe link in any email.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Payments and refunds</h2>
            <p className="mt-2">
              If you purchase paid services, additional terms may apply. Refunds and cancellations are governed by the
              specific agreement or plan you select.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Disclaimer</h2>
            <p className="mt-2">
              Services are provided &quot;as is&quot; without warranties of any kind. CCS is not liable for indirect,
              incidental, or consequential damages.
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
