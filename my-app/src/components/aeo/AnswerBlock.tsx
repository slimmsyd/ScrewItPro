import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Eyebrow from "@/components/ui/Eyebrow";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

/**
 * The answer-first block — the whole point of the page.
 *
 * Answer engines lift the opening of a page as the answer, so the two-sentence
 * answer <p> is literally the next DOM node after the <h1>: no hero image, no
 * decoration, nothing between them. The electric-blue rule marks it as *the*
 * answer without putting anything above it. `data-answer` anchors the check
 * that this ordering survives future edits.
 */
export default function AnswerBlock() {
  return (
    <header
      id="answer"
      style={{
        background: "var(--surface-page)",
        padding: "var(--section-pad-y) 0",
      }}
    >
      <ServerContainer>
        {/* Eyebrow defaults to --blue-electric, which lands at 4.45:1 on white —
            just under AA. --blue-deep clears it without touching the shared
            component (and so the home page's styling) . */}
        <Eyebrow color="var(--blue-deep)">{PAGE.eyebrow}</Eyebrow>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(34px, 5.6vw, var(--text-h1))",
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-display)",
            color: "var(--text-heading)",
            maxWidth: "20ch",
            margin: "0 0 var(--space-5)",
          }}
        >
          {PAGE.h1}
        </h1>

        <p
          data-answer
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(18px, 2.2vw, 22px)",
            fontWeight: 500,
            lineHeight: "var(--leading-body)",
            color: "var(--text-body)",
            maxWidth: "62ch",
            margin: 0,
            paddingLeft: "var(--space-5)",
            borderLeft: "3px solid var(--blue-electric)",
          }}
        >
          {PAGE.answer}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            margin: "var(--space-6) 0 var(--space-5)",
          }}
        >
          <Link
            href={PAGE.cta.primary.href}
            className="aeo-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 54,
              padding: "0 var(--space-6)",
              borderRadius: "var(--radius-pill)",
              background: "var(--blue-deep)",
              color: "var(--white)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {PAGE.cta.primary.label}
          </Link>
          <Link
            href={PAGE.cta.secondary.href}
            className="aeo-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 54,
              padding: "0 var(--space-6)",
              borderRadius: "var(--radius-pill)",
              background: "transparent",
              // Electric blue text is 4.45:1 on white — under AA at 16px.
              // Deep blue on the electric border keeps the accent, passes AA.
              color: "var(--blue-deep)",
              border: "1.5px solid var(--blue-electric)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {PAGE.cta.secondary.label}
          </Link>
        </div>

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
          {PAGE.facts.map((fact) => (
            <li key={fact}>
              <Badge variant="brand">{fact}</Badge>
            </li>
          ))}
        </ul>
      </ServerContainer>
    </header>
  );
}
