import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell, {
  LegalP,
  LegalSection,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of ScrewIt Pros websites, waitlist, accounts, and furniture assembly and delivery services.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | ScrewIt Pros",
    description:
      "Terms governing use of ScrewIt Pros websites, waitlist, and services.",
    url: "/terms",
  },
};

const EFFECTIVE = "July 9, 2026";
const UPDATED = "July 9, 2026";

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      effectiveDate={EFFECTIVE}
      lastUpdated={UPDATED}
    >
      <LegalSection id="agreement" title="1. Agreement to these Terms">
        <LegalP>
          These Terms of Service (&quot;Terms&quot;) are a binding agreement
          between you and ScrewIt Pros LLC (&quot;ScrewIt Pros,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your
          access to and use of our websites, applications, waitlist, accounts,
          and furniture-related services (collectively, the
          &quot;Services&quot;).
        </LegalP>
        <LegalP>
          By accessing or using the Services - including joining the waitlist,
          creating an account, requesting a quote, or booking a job - you agree
          to these Terms and our{" "}
          <Link href="/privacy" style={{ color: "var(--blue-electric)" }}>
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Services.
        </LegalP>
        <LegalP>
          If you use the Services on behalf of a company or other entity, you
          represent that you have authority to bind that entity, and
          &quot;you&quot; includes that entity.
        </LegalP>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Eligibility">
        <LegalP>
          You must be at least 18 years old (or the age of majority in your
          jurisdiction) and able to form a binding contract to use the Services.
          The Services are intended for customers and workforce users in our
          supported service areas, beginning with the Houston Metro area in
          Texas, USA.
        </LegalP>
      </LegalSection>

      <LegalSection id="services" title="3. Description of Services">
        <LegalP>
          ScrewIt Pros offers a hub-based model that may include, depending on
          the product you book:
        </LegalP>
        <LegalUl>
          <li>Pickup or inbound receipt of flat-pack or boxed furniture</li>
          <li>Professional assembly and quality inspection at our hub</li>
          <li>White-glove delivery and placement in the agreed location</li>
          <li>
            Related digital tools: quotes, booking, payments, order tracking,
            support chat, waitlist, and memberships when offered
          </li>
        </LegalUl>
        <LegalP>
          Features may roll out gradually (including private beta / waitlist
          access). We may change, suspend, or discontinue any part of the
          Services with reasonable notice where practicable.
        </LegalP>
      </LegalSection>

      <LegalSection id="accounts" title="4. Accounts and waitlist">
        <LegalP>
          You may join a waitlist with an email address or sign in with a
          supported identity provider. You are responsible for the accuracy of
          information you provide and for safeguarding account credentials and
          devices used to access the Services.
        </LegalP>
        <LegalP>
          Waitlist enrollment does not guarantee a launch date, pricing,
          capacity, or service availability in your area. We may prioritize
          invitations, close the waitlist, or change eligibility criteria.
        </LegalP>
        <LegalP>
          We may suspend or terminate accounts that violate these Terms, pose a
          security risk, or engage in fraud or abuse.
        </LegalP>
      </LegalSection>

      <LegalSection id="bookings" title="5. Quotes, bookings, and changes">
        <LegalP>
          Prices, time estimates, and availability shown online are estimates
          unless we confirm otherwise in writing or at checkout. Final pricing
          may depend on item size/complexity, access conditions, rush requests,
          additional assembly beyond the original scope, or damage discovered
          during intake.
        </LegalP>
        <LegalP>
          You agree to provide accurate item details, tracking information when
          available, delivery address, and access instructions. Incomplete or
          inaccurate information may delay service or result in additional
          charges.
        </LegalP>
        <LegalP>
          Rescheduling, cancellation, and refund rules for a specific booking
          will be presented at checkout or in order communications. If not
          specified: cancel at least 24 hours before a scheduled pickup or
          delivery window for a full refund of prepaid service fees (excluding
          non-refundable third-party costs already incurred). Late cancellations
          or no-shows may forfeit fees.
        </LegalP>
      </LegalSection>

      <LegalSection id="payment" title="6. Payment">
        <LegalP>
          Fees are charged in U.S. dollars unless stated otherwise. Payments are
          processed by third-party processors (such as Stripe). You authorize us
          and our processors to charge the payment method you provide for
          amounts you approve, including deposits, final balances, and
          authorized add-ons.
        </LegalP>
        <LegalP>
          You are responsible for applicable taxes. If a payment fails, we may
          pause work or cancel the booking until payment is resolved.
        </LegalP>
      </LegalSection>

      <LegalSection id="customer-responsibilities" title="7. Your responsibilities">
        <LegalP>You agree to:</LegalP>
        <LegalUl>
          <li>
            Ensure you have legal authority to authorize pickup, assembly, and
            delivery of the items
          </li>
          <li>
            Provide safe access for pickup and delivery (parking, entry codes,
            elevators, pets secured, clear pathways)
          </li>
          <li>
            Confirm that assembled furniture will fit through doorways and into
            the intended room when relevant
          </li>
          <li>
            Inspect delivered items within a reasonable time and report issues
            promptly through our support channels
          </li>
          <li>
            Not use the Services for unlawful purposes or to store or transport
            hazardous materials
          </li>
        </LegalUl>
      </LegalSection>

      <LegalSection id="damage" title="8. Damage, defects, and risk of loss">
        <LegalP>
          Retailer packaging, shipping carriers, and manufacturing defects are
          outside our full control. At hub intake we may document packaging
          condition and photograph items. If damage or missing parts are found,
          we will notify you and may pause assembly until you choose a path
          (wait for replacement parts, proceed with limitations, cancel with
          applicable refund rules, or other options we offer).
        </LegalP>
        <LegalP>
          Risk of loss for goods generally remains with you or the retailer’s
          carrier until we confirm receipt at our hub, then we take reasonable
          care while items are in our custody. After delivery and acceptance at
          your premises, risk transfers back to you, except for damage caused by
          our proven negligence during assembly or delivery.
        </LegalP>
        <LegalP>
          We are not the manufacturer or seller of your furniture unless
          expressly stated. Warranty claims against manufacturers or retailers
          remain your responsibility, though we may assist with documentation
          when feasible.
        </LegalP>
      </LegalSection>

      <LegalSection id="workforce" title="9. Workforce and contractors">
        <LegalP>
          Assembly and delivery may be performed by employees or independent
          contractors engaged by ScrewIt Pros. You agree to treat on-site
          personnel with respect and provide a safe work environment. We may
          reassign technicians or drivers as needed for operations.
        </LegalP>
      </LegalSection>

      <LegalSection id="acceptable-use" title="10. Acceptable use">
        <LegalP>You will not:</LegalP>
        <LegalUl>
          <li>Probe, scan, or reverse engineer the Services except as allowed by law</li>
          <li>Interfere with or disrupt the Services or related networks</li>
          <li>
            Upload malware, spam, or content that is illegal, harassing, or
            infringing
          </li>
          <li>
            Misrepresent your identity or affiliation, or attempt to gain
            unauthorized access to accounts or systems
          </li>
          <li>
            Use automated means to scrape or harvest data from the Services
            without our prior written consent
          </li>
        </LegalUl>
      </LegalSection>

      <LegalSection id="ip" title="11. Intellectual property">
        <LegalP>
          The Services, including branding, logos, mascot artwork, software,
          text, and design, are owned by ScrewIt Pros or its licensors and are
          protected by intellectual property laws. You receive a limited,
          non-exclusive, non-transferable license to use the Services for their
          intended purpose. You may not copy, modify, or create derivative works
          of our materials except as we expressly permit.
        </LegalP>
        <LegalP>
          Feedback you provide may be used by us without obligation to you.
        </LegalP>
      </LegalSection>

      <LegalSection id="third-parties" title="12. Third-party services">
        <LegalP>
          The Services may integrate third-party tools (maps, payments, identity
          providers, analytics, email). Their terms and privacy policies apply
          to your use of those tools. We are not responsible for third-party
          services we do not control.
        </LegalP>
      </LegalSection>

      <LegalSection id="disclaimers" title="13. Disclaimers">
        <LegalP>
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM
          ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT that
          the Services will be uninterrupted, error-free, or free of harmful
          components, or that estimates, availability, or delivery windows will
          always be met.
        </LegalP>
      </LegalSection>

      <LegalSection id="liability" title="14. Limitation of liability">
        <LegalP>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCREWIT PROS AND ITS
          OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS
          OPPORTUNITY, ARISING OUT OF OR RELATED TO THE SERVICES OR THESE TERMS,
          WHETHER BASED IN CONTRACT, TORT, OR ANY OTHER THEORY, EVEN IF ADVISED
          OF THE POSSIBILITY OF SUCH DAMAGES.
        </LegalP>
        <LegalP>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE
          SERVICES OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS
          YOU PAID TO SCREWIT PROS FOR THE SPECIFIC JOB OR SERVICE GIVING RISE
          TO THE CLAIM IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) ONE
          HUNDRED U.S. DOLLARS (US $100) IF YOU HAVE NOT PAID US.
        </LegalP>
        <LegalP>
          Some jurisdictions do not allow certain limitations; in those cases,
          our liability is limited to the fullest extent permitted by law.
        </LegalP>
      </LegalSection>

      <LegalSection id="indemnity" title="15. Indemnification">
        <LegalP>
          You agree to defend, indemnify, and hold harmless ScrewIt Pros and its
          personnel from and against claims, damages, losses, and expenses
          (including reasonable attorneys’ fees) arising out of your misuse of
          the Services, violation of these Terms, or infringement of any third
          party’s rights.
        </LegalP>
      </LegalSection>

      <LegalSection id="disputes" title="16. Governing law and disputes">
        <LegalP>
          These Terms are governed by the laws of the State of Texas, without
          regard to conflict-of-law rules. Except where prohibited, you and
          ScrewIt Pros agree to attempt good-faith informal resolution of any
          dispute by contacting{" "}
          <a
            href="mailto:hello@screwitpro.com"
            style={{ color: "var(--blue-electric)" }}
          >
            hello@screwitpro.com
          </a>{" "}
          before filing a formal claim.
        </LegalP>
        <LegalP>
          Subject to applicable law, exclusive venue for disputes that proceed
          in court will be the state or federal courts located in Harris County,
          Texas, and you consent to personal jurisdiction there.
        </LegalP>
      </LegalSection>

      <LegalSection id="changes-terms" title="17. Changes to these Terms">
        <LegalP>
          We may update these Terms from time to time. We will post the revised
          Terms on this page and update the “Last updated” date. Material
          changes may be communicated by email or notice in the Services where
          required. Continued use after changes become effective constitutes
          acceptance of the updated Terms.
        </LegalP>
      </LegalSection>

      <LegalSection id="misc" title="18. Miscellaneous">
        <LegalP>
          These Terms, together with the Privacy Policy and any order-specific
          terms presented at checkout, are the entire agreement between you and
          us regarding the Services. If any provision is found unenforceable,
          the remaining provisions remain in effect. Our failure to enforce a
          provision is not a waiver. You may not assign these Terms without our
          consent; we may assign them in connection with a reorganization or
          sale of assets. Headings are for convenience only.
        </LegalP>
      </LegalSection>

      <LegalSection id="contact" title="19. Contact">
        <LegalP>
          ScrewIt Pros LLC
          <br />
          Email:{" "}
          <a
            href="mailto:hello@screwitpro.com"
            style={{ color: "var(--blue-electric)" }}
          >
            hello@screwitpro.com
          </a>
          <br />
          Legal:{" "}
          <a
            href="mailto:legal@screwitpro.com"
            style={{ color: "var(--blue-electric)" }}
          >
            legal@screwitpro.com
          </a>
          <br />
          Initial service area: Houston Metro, Texas, USA
        </LegalP>
      </LegalSection>
    </LegalPageShell>
  );
}
