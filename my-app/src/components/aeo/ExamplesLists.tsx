import SectionTitle from "@/components/ui/SectionTitle";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

function PillList({
  label,
  items,
  tone,
}: {
  label: string;
  items: readonly string[];
  tone: "neutral" | "brand";
}) {
  const brand = tone === "brand";
  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "var(--tracking-caps)",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: "0 0 var(--space-4)",
        }}
      >
        {label}
      </h3>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14.5,
              fontWeight: brand ? 600 : 500,
              lineHeight: 1.2,
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              background: brand ? "var(--blue-50)" : "transparent",
              border: `1px solid ${brand ? "var(--blue-100)" : "var(--border-default)"}`,
              color: brand ? "var(--blue-deep)" : "var(--ink-700)",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Specifics get quoted; vague claims get skipped. Real <ul>/<li> so an answer
 * engine can lift the list cleanly.
 *
 * Retailers are text, never logos: the marks are third-party trademarks, and
 * images would carry no extractable meaning anyway.
 */
export default function ExamplesLists() {
  return (
    <section
      id="what-we-assemble"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <ServerContainer>
        <SectionTitle>{PAGE.examples.title}</SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-7)",
            margin: "var(--space-6) 0 0",
          }}
        >
          <PillList
            label={PAGE.examples.itemTypesLabel}
            items={PAGE.examples.itemTypes}
            tone="neutral"
          />
          <PillList
            label={PAGE.examples.retailersLabel}
            items={PAGE.examples.retailers}
            tone="brand"
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: "var(--leading-body)",
            // --ink-300 only reaches 2.56:1 on white; --text-muted clears AA.
            color: "var(--text-muted)",
            maxWidth: "72ch",
            margin: "var(--space-6) 0 0",
          }}
        >
          {PAGE.examples.retailerNote}
        </p>
      </ServerContainer>
    </section>
  );
}
