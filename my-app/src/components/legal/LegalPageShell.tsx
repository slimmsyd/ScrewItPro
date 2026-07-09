import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ASSETS } from "@/lib/site";

type LegalPageShellProps = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  children: ReactNode;
};

/**
 * Shared chrome for Privacy Policy / Terms of Service.
 * Matches ScrewIt Pros tokens; keeps legal pages readable and scannable.
 */
export default function LegalPageShell({
  title,
  effectiveDate,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--white)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--gray-100)",
          background: "var(--white)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--blue-deep)",
            }}
          >
            <Image
              src={ASSETS.logoDeep}
              alt="ScrewIt Pros"
              width={32}
              height={32}
              style={{ display: "block", borderRadius: 6 }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                letterSpacing: "var(--tracking-display)",
              }}
            >
              ScrewIt Pros
            </span>
          </Link>
          <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link
              href="/privacy"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ink-500)",
                textDecoration: "none",
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ink-500)",
                textDecoration: "none",
              }}
            >
              Terms
            </Link>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--blue-electric)",
                textDecoration: "none",
              }}
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 24px 96px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--blue-electric)",
            margin: "0 0 12px",
          }}
        >
          Legal
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 44px)",
            lineHeight: 1.1,
            letterSpacing: "var(--tracking-display)",
            color: "var(--text-heading)",
            margin: "0 0 16px",
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-muted)",
            margin: "0 0 40px",
            lineHeight: 1.55,
          }}
        >
          Effective date: {effectiveDate}
          <br />
          Last updated: {lastUpdated}
        </p>

        <article className="legal-prose">{children}</article>

        <p
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--gray-100)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-300)",
            lineHeight: 1.55,
          }}
        >
          © {new Date().getFullYear()} ScrewIt Pros LLC. All rights reserved.{" "}
          <Link href="/" style={{ color: "var(--blue-electric)" }}>
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 19,
          fontWeight: 600,
          color: "var(--text-heading)",
          margin: "0 0 12px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 16,
          lineHeight: 1.65,
          color: "var(--text-body)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return (
    <ul
      style={{
        margin: "0 0 14px",
        paddingLeft: 22,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {children}
    </ul>
  );
}
