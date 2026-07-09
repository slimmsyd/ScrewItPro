"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ASSETS, CTA_LABEL } from "@/lib/site";

const navServices = [
  ["Furniture Assembly", "#services"],
  ["Large Furniture Assembly", "#services"],
  ["Office Furniture Assembly", "#services"],
  ["White Glove Delivery", "#services"],
  ["Membership Plans", "#services"],
] as const;

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 15,
        fontWeight: 500,
        color: h ? "var(--blue-deep)" : "var(--ink-700)",
        textDecoration: "none",
        transition: "color 150ms",
        padding: "8px 0",
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
}

function NavDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 500,
          color: open ? "var(--blue-deep)" : "var(--ink-700)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        Services
        <ChevronDown
          size={15}
          style={{
            transition: "transform 150ms",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            minWidth: 230,
            background: "var(--white)",
            border: "1px solid var(--gray-100)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
          }}
        >
          {navServices.map(([lbl, href]) => (
            <a
              key={lbl}
              href={href}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                color: "var(--ink-700)",
                textDecoration: "none",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--blue-50)";
                e.currentTarget.style.color = "var(--blue-deep)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink-700)";
              }}
            >
              {lbl}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("English");
  const langs = ["English", "Español"];
  return (
    <div style={{ position: "relative" }} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
          borderRadius: 8,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--ink-700)",
        }}
      >
        <Globe size={16} />
        <span style={{ fontWeight: 500 }}>{lang}</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            minWidth: 140,
            background: "var(--white)",
            border: "1px solid var(--gray-100)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
          }}
        >
          {langs.map((l) => {
            const active = l === lang;
            return (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-body)",
                  fontSize: 14.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--blue-deep)" : "var(--ink-700)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  textAlign: "left",
                }}
              >
                {l}
                {active && <Check size={15} color="var(--blue-electric)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Burger({ open, onClick }: { open: boolean; onClick: () => void }) {
  const line = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    left: 11,
    width: 22,
    height: 2.5,
    borderRadius: 2,
    background: "var(--blue-deep)",
    transition:
      "transform .32s cubic-bezier(.16,1,.3,1), top .32s cubic-bezier(.16,1,.3,1)",
    ...extra,
  });
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        position: "relative",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        marginRight: -8,
        flexShrink: 0,
      }}
    >
      <span
        style={line({
          top: open ? 21.5 : 18,
          transform: open ? "rotate(45deg)" : "none",
        })}
      />
      <span
        style={line({
          top: open ? 21.5 : 25,
          transform: open ? "rotate(-45deg)" : "none",
        })}
      />
    </button>
  );
}

export default function Nav({
  onCta,
  onToggleMenu,
  menuOpen,
  scrolled,
}: {
  onCta: () => void;
  onToggleMenu: () => void;
  menuOpen: boolean;
  scrolled: boolean;
}) {
  const mobile = useIsMobile();
  const solid = scrolled || menuOpen;
  const [logoRotation, setLogoRotation] = useState(0);

  useEffect(() => {
    const onScroll = () => setLogoRotation(window.scrollY * 0.3);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        background: solid ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: solid ? "saturate(180%) blur(10px)" : "none",
        WebkitBackdropFilter: solid ? "saturate(180%) blur(10px)" : "none",
        borderBottom: `1px solid ${solid ? "var(--gray-100)" : "transparent"}`,
        boxShadow: solid ? "var(--shadow-sm)" : "none",
        transition:
          "background 260ms ease, box-shadow 260ms ease, border-color 260ms ease",
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: mobile ? 60 : 72,
        }}
      >
        <Link
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <Image
            src={ASSETS.logoS}
            alt=""
            width={mobile ? 34 : 44}
            height={mobile ? 34 : 44}
            style={{
              display: "block",
              transformOrigin: "center",
              transform: `rotate(${logoRotation}deg)`,
              willChange: "transform",
            }}
            priority
          />
          <Image
            src={ASSETS.logoWordmark}
            alt="ScrewIt Pros"
            width={mobile ? 120 : 168}
            height={mobile ? 30 : 42}
            style={{ height: mobile ? 30 : 42, width: "auto", display: "block" }}
            priority
          />
        </Link>

        {!mobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <NavLink href="#how">How It Works</NavLink>
            <NavDropdown />
            <NavLink href="#why">Why Us</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>
        )}

        {!mobile ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <LangSwitcher />
            <Button variant="primary" size="sm" onClick={onCta}>
              {CTA_LABEL}
            </Button>
          </div>
        ) : (
          <Burger open={menuOpen} onClick={onToggleMenu} />
        )}
      </Container>
    </nav>
  );
}
