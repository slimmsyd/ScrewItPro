import { ShieldCheck, ScanSearch, UserCheck, Wrench } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

/** Icons pair to content by index — content order is the spec's proof order. */
const ICONS = [ShieldCheck, ScanSearch, UserCheck, Wrench];

/**
 * Proof, placed immediately after the answer per the spec: answer, then prove it.
 * Post-launch, reviews and a "builds completed" count plug in here.
 */
export default function ProofGrid() {
  return (
    <section
      id="proof"
      style={{
        background: "var(--surface-subtle)",
        padding: "var(--section-pad-y) 0",
      }}
    >
      <ServerContainer>
        <SectionTitle>{PAGE.proof.title}</SectionTitle>

        <ul
          style={{
            listStyle: "none",
            margin: "var(--space-6) 0 0",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {PAGE.proof.items.map((item, i) => {
            const Icon = ICONS[i];
            const brand = item.tone === "brand";
            return (
              <li
                key={item.title}
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-6)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: brand ? "var(--blue-50)" : "var(--status-success-bg)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Icon
                    size={22}
                    color={brand ? "var(--blue-electric)" : "var(--status-success)"}
                    aria-hidden
                  />
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "var(--text-heading)",
                    margin: "0 0 var(--space-2)",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15.5,
                    lineHeight: "var(--leading-body)",
                    color: "var(--text-muted)",
                    maxWidth: "46ch",
                    margin: 0,
                  }}
                >
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </ServerContainer>
    </section>
  );
}
