import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | The Unscripted Room" },
      {
        name: "description",
        content:
          "The Terms of Service that govern your use of CCS and The Unscripted Room websites, services, and communications.",
      },
      { property: "og:title", content: "Terms of Service | The Unscripted Room" },
      {
        property: "og:description",
        content: "Terms governing use of our websites, services, and communications.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms of Service" effective="February 6, 2026">
      <p>
        These Terms of Service ("Terms") govern your use of CCS websites, services, and
        communications. By accessing or using our services, you agree to these Terms.
      </p>
      <LegalSection title="Use of services">
        <ul>
          <li>You agree to provide accurate information and keep it up to date.</li>
          <li>You will not misuse the services or attempt unauthorized access.</li>
          <li>We may update or discontinue services at any time.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Scheduling and communications">
        <p>
          By submitting forms or scheduling a session, you authorize CCS to contact you via email
          and SMS for scheduling, updates, and related communications. Message frequency varies.
          Message and data rates may apply. Consent is not a condition of purchase.
        </p>
        <p>
          To opt out of SMS, reply <strong>STOP</strong>. For help, reply <strong>HELP</strong>. To
          unsubscribe from emails, use the unsubscribe link in any email.
        </p>
      </LegalSection>
      <LegalSection title="Payments and refunds">
        <p>
          If you purchase paid services, additional terms may apply. Refunds and cancellations are
          governed by the specific agreement or plan you select.
        </p>
      </LegalSection>
      <LegalSection title="Disclaimer">
        <p>
          Services are provided "as is" without warranties of any kind. CCS is not liable for
          indirect, incidental, or consequential damages.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Questions? Contact us at{" "}
          <Link className="text-foreground underline hover:text-purple" to="/contact">
            /contact
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
