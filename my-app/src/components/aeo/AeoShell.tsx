import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ASSETS, JOIN_PATH, CTA_LABEL } from "@/lib/site";
import Footer from "@/components/home/Footer";

/**
 * Chrome for the AEO landing page. Modeled on legal/LegalPageShell — a Server
 * Component with its own lightweight header.
 *
 * home/Nav is deliberately not reused: it needs state owned by LandingPage
 * (onQuote, menuOpen, scrolled) and its links are bare hashes that break off the
 * home page. Footer is safe — LocaleProvider lives in the root layout and its
 * links are absolute.
 */
export default function AeoShell({ children }: { children: ReactNode }) {
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
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "14px clamp(20px, 5vw, 32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/"
            className="aeo-link"
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
              // Decorative: the wordmark beside it already names the business,
              // so alt text here would just repeat it to a screen reader.
              alt=""
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

          <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              href="/#how"
              className="aeo-link aeo-nav-link"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ink-500)",
                textDecoration: "none",
                transition: "color var(--duration-base) ease",
              }}
            >
              How it works
            </Link>
            <Link
              href={JOIN_PATH}
              className="aeo-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 20px",
                borderRadius: "var(--radius-pill)",
                background: "var(--blue-deep)",
                color: "var(--white)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {CTA_LABEL}
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <Footer />
    </div>
  );
}
