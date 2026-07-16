"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ASSETS,
  HOUSTON_ASSEMBLY_PATH,
  JOIN_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const style = {
    fontFamily: "var(--font-body)",
    fontSize: 14,
    color: h ? "var(--blue-electric)" : "var(--ink-700)",
    textDecoration: "none",
    transition: "color 150ms",
    cursor: "pointer" as const,
  };

  if (external) {
    return (
      <a
        href={href}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={style}
    >
      {children}
    </Link>
  );
}

function SocialIcon({ path, label }: { path: string; label: string }) {
  const [h, setH] = useState(false);
  return (
    <a
      href="#top"
      aria-label={label}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        color: h ? "var(--blue-electric)" : "var(--ink-500)",
        transition: "color 150ms",
        display: "flex",
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </a>
  );
}

export default function Footer() {
  const { t } = useLocale();

  const cols: {
    head: string;
    items: { label: string; href: string }[];
  }[] = [
    {
      head: t("footer.services"),
      items: [
        {
          label: t("footer.houstonAssembly"),
          href: HOUSTON_ASSEMBLY_PATH,
        },
        { label: t("footer.furnitureAssembly"), href: "/#services" },
        { label: t("footer.largeAssembly"), href: "/#services" },
        { label: t("footer.officeAssembly"), href: "/#services" },
        { label: t("footer.pickup"), href: "/#services" },
        { label: t("footer.whiteGlove"), href: "/#services" },
        { label: t("footer.membership"), href: "/#services" },
      ],
    },
    {
      head: t("footer.company"),
      items: [
        { label: t("footer.howItWorks"), href: "/#how" },
        { label: t("footer.whyUs"), href: "/#why" },
        { label: t("footer.serviceArea"), href: "/#area" },
        { label: t("footer.contact"), href: "mailto:hello@screwitpros.com" },
      ],
    },
    {
      head: t("footer.support"),
      items: [
        { label: t("footer.faq"), href: "/#faq" },
        { label: t("footer.freeQuote"), href: JOIN_PATH },
        { label: t("footer.track"), href: JOIN_PATH },
      ],
    },
    {
      head: t("footer.legal"),
      items: [
        { label: t("footer.terms"), href: TERMS_PATH },
        { label: t("footer.privacy"), href: PRIVACY_PATH },
      ],
    },
  ];

  const socials = [
    {
      label: "Facebook",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      label: "Instagram",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
      label: "LinkedIn",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      label: "TikTok",
      path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z",
    },
  ];

  return (
    <footer
      style={{
        background: "var(--gray-50)",
        color: "var(--ink-700)",
        borderTop: "1px solid var(--gray-100)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "80px 24px 48px",
        }}
      >
        <div style={{ marginBottom: 64 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontStyle: "italic",
              color: "var(--text-heading)",
              lineHeight: 1.3,
              maxWidth: 480,
              margin: 0,
              letterSpacing: "var(--tracking-display)",
            }}
          >
            {t("footer.tagline1")}
            <br />
            {t("footer.tagline2")}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "40px 24px",
            marginBottom: 64,
          }}
        >
          {cols.map((c) => (
            <div key={c.head}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--ink-500)",
                  marginBottom: 16,
                }}
              >
                {c.head}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {c.items.map((it) => (
                  <FooterLink key={it.label} href={it.href}>
                    {it.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--gray-200)",
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: "var(--white)",
                  border: "1px solid var(--gray-200)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Image
                  src={ASSETS.logoS}
                  alt=""
                  width={22}
                  height={22}
                  style={{ display: "block" }}
                />
              </span>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: "var(--text-heading)",
                  letterSpacing: "var(--tracking-display)",
                }}
              >
                Screwit{" "}
                <span
                  style={{
                    color: "var(--blue-electric)",
                    fontSize: 14,
                    letterSpacing: "var(--tracking-caps)",
                  }}
                >
                  PROS
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {socials.map((s) => (
                <SocialIcon key={s.label} path={s.path} label={s.label} />
              ))}
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--ink-500)",
            }}
          >
            {t("footer.rights", { year: new Date().getFullYear() })}
          </span>
        </div>
      </div>
    </footer>
  );
}
