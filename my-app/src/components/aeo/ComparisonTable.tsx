import { Check } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import ServerContainer from "@/components/ui/ServerContainer";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

const cellBase = {
  fontFamily: "var(--font-body)",
  fontSize: 15,
  lineHeight: "var(--leading-body)",
  padding: "var(--space-4) var(--space-5)",
  borderTop: "1px solid var(--gray-100)",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
};

const headBase = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "var(--tracking-caps)",
  textTransform: "uppercase" as const,
  padding: "var(--space-4) var(--space-5)",
  textAlign: "left" as const,
};

/**
 * A real semantic <table> — the spec's whole reason for this section is that
 * answer engines quote tables directly. Below 640px CSS renders the rows as
 * cards while the DOM stays a table (see .aeo-table in globals.css), so the
 * markup an AI reads is identical at every viewport.
 *
 * The ScrewIt column carries one continuous tint from the deep-blue header down
 * through every row; the competitor column stays deliberately inert.
 */
export default function ComparisonTable() {
  return (
    <section
      id="comparison"
      style={{
        background: "var(--surface-subtle)",
        padding: "var(--section-pad-y) 0",
      }}
    >
      <ServerContainer>
        <SectionTitle>{PAGE.comparison.title}</SectionTitle>

        <table
          className="aeo-table"
          style={{
            width: "100%",
            marginTop: "var(--space-6)",
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <caption
            style={{
              captionSide: "bottom",
              textAlign: "left",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              lineHeight: "var(--leading-body)",
              color: "var(--text-muted)",
              paddingTop: "var(--space-4)",
            }}
          >
            {PAGE.comparison.caption}
          </caption>

          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>

          <thead>
            <tr>
              <th
                scope="col"
                style={{
                  ...headBase,
                  color: "var(--text-muted)",
                  background: "var(--white)",
                }}
              >
                Feature
              </th>
              <th
                scope="col"
                style={{
                  ...headBase,
                  background: "var(--gray-100)",
                  color: "var(--ink-500)",
                }}
              >
                {PAGE.comparison.themColumn}
              </th>
              <th
                scope="col"
                style={{
                  ...headBase,
                  background: "var(--blue-deep)",
                  color: "var(--white)",
                }}
              >
                {PAGE.comparison.usColumn}
              </th>
            </tr>
          </thead>

          <tbody>
            {PAGE.comparison.rows.map((row) => (
              <tr key={row.feature}>
                <th
                  scope="row"
                  style={{
                    ...cellBase,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                  }}
                >
                  {row.feature}
                </th>
                <td
                  data-label={PAGE.comparison.themColumn}
                  style={{ ...cellBase, color: "var(--text-muted)" }}
                >
                  {row.them}
                </td>
                <td
                  className="is-us"
                  data-label={PAGE.comparison.usColumn}
                  style={{
                    ...cellBase,
                    background: "var(--blue-50)",
                    borderLeft: "1px solid var(--blue-100)",
                    color: "var(--ink-900)",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "flex-start",
                      gap: "var(--space-2)",
                    }}
                  >
                    <Check
                      size={16}
                      color="var(--status-success)"
                      style={{ flex: "none", marginTop: 4 }}
                      aria-hidden
                    />
                    {row.us}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ServerContainer>
    </section>
  );
}
