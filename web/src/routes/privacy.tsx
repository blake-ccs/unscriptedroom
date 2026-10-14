import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | The Unscripted Room" },
      {
        name: "description",
        content:
          "How CCS and The Unscripted Room collect, use, and share information when you visit our websites, submit forms, or interact with our services.",
      },
      { property: "og:title", content: "Privacy Policy | The Unscripted Room" },
      { property: "og:description", content: "How we collect, use, and share your information." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" effective="February 6, 2026">
      <p>
        CCS ("we," "us," or "our") respects your privacy. This policy explains how we collect, use,
        and share information when you visit our websites, submit forms, or interact with our
        services.
      </p>
      <LegalSection title="Information we collect">
        <ul>
          <li>Contact details (name, email, phone) you provide.</li>
          <li>Form responses and preferences (e.g., availability, interests).</li>
          <li>Technical data (IP address, browser, device, pages viewed).</li>
          <li>Scheduling data from Calendly (event details, time, location).</li>
        </ul>
      </LegalSection>
      <LegalSection title="How we use information">
        <ul>
          <li>To respond to requests, deliver services, and schedule sessions.</li>
          <li>To send transactional and marketing communications.</li>
          <li>To improve our websites, programs, and customer experience.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Messaging (email & SMS)">
        <p>
          By providing your contact information, you consent to receive communications from CCS and
          The Unscripted Room. You may receive email and/or SMS messages about scheduling, updates,
          and your expressed interest. We do not share or sell your mobile number. Message frequency
          may vary. Standard message and data rates may apply. Consent is not a condition of
          purchase.
        </p>
        <p>
          To opt out of SMS, reply <strong>STOP</strong> at any time. For help, reply{" "}
          <strong>HELP</strong>. To unsubscribe from emails, use the unsubscribe link in any email.
        </p>
      </LegalSection>
      <LegalSection title="Sharing">
        <p>
          We share information with trusted service providers (e.g., email, CRM, scheduling) to
          operate our services. We do not sell your personal information.
        </p>
      </LegalSection>
      <LegalSection title="Data retention">
        <p>
          We retain information as needed to provide services, comply with obligations, and resolve
          disputes.
        </p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>You may request access, correction, or deletion of your information by contacting us.</p>
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
