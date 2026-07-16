import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

/**
 * Closing CTA. Plain <Link> anchors, not the client Button — crawlable, zero JS,
 * and an anchor is what an answer engine extracts as the action to take.
 *
 * --shadow-focus is a blue ring, invisible against --surface-brand, so links
 * here use .aeo-cta-link for a white focus ring instead.
 */
export default function CtaBand() {
  return (
    <section
      id="get-started"
      style={{
        background: "var(--surface-brand)",
        padding: "var(--section-pad-y) 0",
      }}
    >
      <ServerContainer>
        <SectionTitle inverse>{PAGE.cta.title}</SectionTitle>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: "var(--leading-body)",
            color: "var(--blue-200)",
            maxWidth: "52ch",
            margin: "var(--space-4) 0 var(--space-6)",
          }}
        >
          {PAGE.cta.body}
        </p>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}
        >
          <Link
            href={PAGE.cta.primary.href}
            className="aeo-cta-link aeo-cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 54,
              padding: "0 var(--space-6)",
              borderRadius: "var(--radius-pill)",
              background: "var(--white)",
              color: "var(--blue-deep)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
              transition: "background var(--duration-base) ease",
            }}
          >
            {PAGE.cta.primary.label}
          </Link>
          <Link
            href={PAGE.cta.secondary.href}
            className="aeo-cta-link aeo-cta-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 54,
              padding: "0 var(--space-6)",
              borderRadius: "var(--radius-pill)",
              background: "transparent",
              color: "var(--white)",
              border: "1.5px solid rgba(255, 255, 255, 0.5)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              transition:
                "background var(--duration-base) ease, border-color var(--duration-base) ease",
            }}
          >
            {PAGE.cta.secondary.label}
          </Link>
        </div>
      </ServerContainer>
    </section>
  );
}
