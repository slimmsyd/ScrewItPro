import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell, {
  LegalP,
  LegalSection,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ScrewIt Pros collects, uses, and protects your personal information when you use our website, waitlist, and furniture assembly services.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | ScrewIt Pros",
    description:
      "How ScrewIt Pros collects, uses, and protects your personal information.",
    url: "/privacy",
  },
};

const EFFECTIVE = "July 9, 2026";
const UPDATED = "July 9, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      effectiveDate={EFFECTIVE}
      lastUpdated={UPDATED}
    >
      <LegalSection id="intro" title="1. Introduction">
        <LegalP>
          ScrewIt Pros LLC (&quot;ScrewIt Pros,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) provides furniture pickup,
          workshop assembly, and white-glove delivery services, along with
          related websites, waitlists, and communications (collectively, the
          &quot;Services&quot;).
        </LegalP>
        <LegalP>
          This Privacy Policy explains what information we collect, how we use
          it, when we share it, and the choices you have. By using the Services,
          you agree to this Policy. If you do not agree, please do not use the
          Services.
        </LegalP>
        <LegalP>
          This Policy should be read together with our{" "}
          <Link href="/terms" style={{ color: "var(--blue-electric)" }}>
            Terms of Service
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection id="scope" title="2. Scope">
        <LegalP>This Policy applies to information we collect when you:</LegalP>
        <LegalUl>
          <li>Visit screwitpros.com or related marketing pages</li>
          <li>Join our waitlist or subscribe to product updates</li>
          <li>Create an account or sign in (including via Google or other providers)</li>
          <li>Request a quote, book a job, or contact support</li>
          <li>Interact with our chat, email, or other messaging tools</li>
          <li>Use customer, technician, driver, or admin portals (when available)</li>
        </LegalUl>
        <LegalP>
          It does not apply to third-party websites or services that we do not
          control, even if they are linked from our Services.
        </LegalP>
      </LegalSection>

      <LegalSection id="collect" title="3. Information we collect">
        <LegalP>
          <strong>Information you provide</strong>
        </LegalP>
        <LegalUl>
          <li>
            <strong>Contact details:</strong> name, email address, phone number
          </li>
          <li>
            <strong>Account profile:</strong> display name, photo (if provided
            via OAuth), preferences, and communication settings
          </li>
          <li>
            <strong>Service details:</strong> delivery address, access notes,
            furniture descriptions, retailer links, tracking numbers, and job
            notes
          </li>
          <li>
            <strong>Communications:</strong> messages you send us via forms,
            chat, email, or support tools
          </li>
          <li>
            <strong>Marketing opt-in:</strong> waitlist or newsletter signup
            source and consent timestamp
          </li>
        </LegalUl>
        <LegalP>
          <strong>Information collected automatically</strong>
        </LegalP>
        <LegalUl>
          <li>
            Device and browser type, approximate location (city/region),
            language, referring pages, and usage events
          </li>
          <li>
            Cookies, local storage, and similar technologies used for session
            management, preferences, and analytics
          </li>
          <li>
            Log data such as IP address, timestamps, and error diagnostics needed
            to operate and secure the Services
          </li>
        </LegalUl>
        <LegalP>
          <strong>Information from third parties</strong>
        </LegalP>
        <LegalUl>
          <li>
            Identity providers (e.g., Google) when you choose to sign in -
            typically name, email, and profile image as permitted by that
            provider
          </li>
          <li>
            Payment processors (e.g., Stripe) for payment status and limited
            billing metadata; we do not store full card numbers on our servers
          </li>
          <li>
            Maps / geocoding providers when you enter an address for service
            area validation or delivery planning
          </li>
        </LegalUl>
      </LegalSection>

      <LegalSection id="use" title="4. How we use information">
        <LegalP>We use personal information to:</LegalP>
        <LegalUl>
          <li>Provide, operate, and improve the Services</li>
          <li>Manage the waitlist and notify you about launch or availability</li>
          <li>Create and maintain accounts, sessions, and role-based access</li>
          <li>
            Process bookings, payments, invoices, and service communications
          </li>
          <li>
            Coordinate hub operations (inbound boxes, assembly, delivery) with
            our team and contractors
          </li>
          <li>
            Send transactional messages (confirmations, status updates, receipts)
          </li>
          <li>
            Send marketing or product updates only where you have opted in or
            where permitted by law; you can unsubscribe at any time
          </li>
          <li>
            Detect, prevent, and investigate fraud, abuse, and security
            incidents
          </li>
          <li>Comply with legal obligations and enforce our Terms</li>
          <li>
            Analyze aggregate usage to improve UX, performance, and service
            quality
          </li>
        </LegalUl>
      </LegalSection>

      <LegalSection id="legal-bases" title="5. Legal bases (where applicable)">
        <LegalP>
          If you are in a jurisdiction that requires a legal basis for
          processing (such as the EEA/UK), we rely on one or more of: performing
          a contract with you; our legitimate interests (e.g., securing and
          improving the Services); your consent (e.g., marketing); and legal
          compliance.
        </LegalP>
      </LegalSection>

      <LegalSection id="share" title="6. How we share information">
        <LegalP>
          We do not sell your personal information. We may share information
          with:
        </LegalP>
        <LegalUl>
          <li>
            <strong>Service providers</strong> who help us run the business
            (hosting, databases, email delivery, analytics, payments, maps,
            authentication, customer support tools) under contractual
            confidentiality and security obligations
          </li>
          <li>
            <strong>Technicians, drivers, and operations staff</strong> who need
            job-related details to perform assembly and delivery
          </li>
          <li>
            <strong>Professional advisors</strong> (legal, accounting) when
            needed
          </li>
          <li>
            <strong>Authorities or counterparties</strong> when required by law,
            legal process, or to protect rights, safety, and property
          </li>
          <li>
            <strong>Business transfers</strong> in connection with a merger,
            acquisition, financing, or sale of assets, subject to appropriate
            confidentiality protections
          </li>
        </LegalUl>
      </LegalSection>

      <LegalSection id="retention" title="7. Retention">
        <LegalP>
          We keep personal information only as long as needed for the purposes
          described in this Policy, including to provide the Services, resolve
          disputes, enforce agreements, and meet legal, tax, and accounting
          requirements. Waitlist and marketing records are retained until you
          unsubscribe or request deletion, unless we must keep them longer by
          law.
        </LegalP>
      </LegalSection>

      <LegalSection id="security" title="8. Security">
        <LegalP>
          We use administrative, technical, and organizational measures designed
          to protect personal information, including encryption in transit
          (HTTPS), access controls, and least-privilege practices for staff
          tools. No method of transmission or storage is 100% secure; we cannot
          guarantee absolute security.
        </LegalP>
      </LegalSection>

      <LegalSection id="rights" title="9. Your choices and rights">
        <LegalP>Depending on your location, you may have rights to:</LegalP>
        <LegalUl>
          <li>Access, correct, or delete personal information we hold about you</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Opt out of marketing emails (unsubscribe link in each message)</li>
          <li>
            Request a portable copy of certain information (data portability)
          </li>
        </LegalUl>
        <LegalP>
          To exercise these rights, contact us at the email below. We may need
          to verify your identity before fulfilling a request. Some rights may
          be limited by law or our legitimate operational needs (for example,
          retaining transaction records).
        </LegalP>
      </LegalSection>

      <LegalSection id="cookies" title="10. Cookies and similar technologies">
        <LegalP>
          We use cookies and similar technologies for essential site functions
          (sessions, security, preferences) and, where enabled, analytics and
          performance measurement. You can control cookies through your browser
          settings; disabling some cookies may affect site functionality.
        </LegalP>
      </LegalSection>

      <LegalSection id="children" title="11. Children">
        <LegalP>
          The Services are not directed to children under 13 (or the minimum age
          required in your jurisdiction). We do not knowingly collect personal
          information from children. If you believe a child has provided us
          information, contact us and we will take appropriate steps to delete
          it.
        </LegalP>
      </LegalSection>

      <LegalSection id="transfers" title="12. International transfers">
        <LegalP>
          We are based in the United States. If you access the Services from
          another country, your information may be processed in the U.S. and
          other countries where our providers operate, which may have different
          data-protection laws than your home country.
        </LegalP>
      </LegalSection>

      <LegalSection id="ca" title="13. U.S. state privacy notices">
        <LegalP>
          Residents of certain U.S. states (including California) may have
          additional rights regarding personal information, such as the right to
          know categories of data collected, request deletion, and opt out of
          “sale” or “sharing” as defined by applicable law. We do not sell
          personal information as commonly understood, and we do not use
          sensitive personal information for unexpected purposes. To submit a
          request, email us as described below. Authorized agents may submit
          requests with valid authorization.
        </LegalP>
      </LegalSection>

      <LegalSection id="changes" title="14. Changes to this Policy">
        <LegalP>
          We may update this Privacy Policy from time to time. We will post the
          updated version on this page and revise the “Last updated” date. If
          changes are material, we will provide additional notice as required by
          law (for example, by email or an in-product notice). Continued use of
          the Services after an update means you accept the revised Policy.
        </LegalP>
      </LegalSection>

      <LegalSection id="contact" title="15. Contact us">
        <LegalP>
          ScrewIt Pros LLC
          <br />
          Privacy inquiries:{" "}
          <a
            href="mailto:privacy@screwitpros.com"
            style={{ color: "var(--blue-electric)" }}
          >
            privacy@screwitpros.com
          </a>
          <br />
          General support:{" "}
          <a
            href="mailto:hello@screwitpros.com"
            style={{ color: "var(--blue-electric)" }}
          >
            hello@screwitpros.com
          </a>
          <br />
          Service area (initial): Houston Metro, Texas, USA
        </LegalP>
        <LegalP>
          If you have questions about this Policy or our data practices, please
          contact us and we will respond as soon as reasonably practicable.
        </LegalP>
      </LegalSection>
    </LegalPageShell>
  );
}
