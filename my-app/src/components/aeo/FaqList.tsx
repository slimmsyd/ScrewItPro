import SectionTitle from "@/components/ui/SectionTitle";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

/**
 * On-page FAQ, rendered from the same `PAGE.faqs` array the FAQPage JSON-LD is
 * built from — the spec requires the two to match exactly, and sharing the array
 * makes drift impossible.
 *
 * Native <details>/<summary>: no JS, and answers stay in the DOM while collapsed
 * so crawlers and answer engines read all six regardless of open state.
 */
export default function FaqList() {
  return (
    <section
      id="faq"
      className="aeo-faq"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <ServerContainer>
        <SectionTitle>{PAGE.faqTitle}</SectionTitle>

        {/* Measure caps the answers at a scannable width, but the section keeps
            the page's left edge — centering it here would break the alignment
            every other section shares. */}
        <div style={{ marginTop: "var(--space-6)", maxWidth: 760 }}>
          {PAGE.faqs.map((faq) => (
            <details
              key={faq.q}
              style={{ borderBottom: "1px solid var(--gray-100)" }}
            >
              <summary
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-5)",
                  minHeight: 44,
                  padding: "var(--space-4) var(--space-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "var(--text-heading)",
                  transition: "color var(--duration-base) ease",
                }}
              >
                {faq.q}
              </summary>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15.5,
                  lineHeight: "var(--leading-body)",
                  color: "var(--text-muted)",
                  maxWidth: "62ch",
                  margin: 0,
                  padding: "0 var(--space-2) var(--space-5)",
                }}
              >
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </ServerContainer>
    </section>
  );
}
