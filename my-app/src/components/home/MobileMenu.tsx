"use client";

import { useEffect, useRef, useState } from "react";
import { CTA_LABEL } from "@/lib/site";

export default function MobileMenu({
  open,
  onClose,
  onCta,
  waitlist,
}: {
  open: boolean;
  onClose: () => void;
  onCta: () => void;
  waitlist: boolean;
}) {
  const navOffset = waitlist ? 106 : 68;
  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const links = [
    ["How It Works", "#how"],
    ["Services", "#services"],
    ["Why Us", "#why"],
    ["FAQ", "#faq"],
  ] as const;

  const dragging = startX.current !== null;
  const stag = (d: number) =>
    `opacity .3s ease ${open ? d : 0}s, transform .34s cubic-bezier(.16,1,.3,1) ${open ? d : 0}s`;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(11,16,48,0.34)",
          zIndex: 800,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .32s ease",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (startX.current != null)
            setDrag(Math.max(0, e.clientX - startX.current));
        }}
        onPointerUp={(e) => {
          if (startX.current != null) {
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (dx > 60) onClose();
            setDrag(0);
          }
        }}
        onPointerCancel={() => {
          startX.current = null;
          setDrag(0);
        }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "86%",
          maxWidth: 360,
          background: "var(--white)",
          borderRadius: "24px 0 0 24px",
          boxShadow: "-12px 0 44px rgba(4,32,155,0.18)",
          zIndex: 850,
          transform: open ? `translateX(${drag}px)` : "translateX(100%)",
          transition: dragging
            ? "none"
            : "transform .34s cubic-bezier(.16,1,.3,1)",
          display: "flex",
          flexDirection: "column",
          padding: `${navOffset + 18}px 26px 28px`,
          touchAction: "pan-y",
        }}
      >
        {links.map(([l, h], i) => (
          <a
            key={l}
            href={h}
            onClick={onClose}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 27,
              letterSpacing: "var(--tracking-display)",
              color: "var(--text-heading)",
              textDecoration: "none",
              padding: "13px 0",
              opacity: open ? 1 : 0,
              transform: open ? "none" : "translateX(18px)",
              transition: stag(0.08 + i * 0.045),
              cursor: "pointer",
            }}
          >
            {l}
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            onCta();
          }}
          style={{
            marginTop: 22,
            height: 54,
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "var(--blue-deep)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            opacity: open ? 1 : 0,
            transform: open ? "none" : "translateX(18px)",
            transition: stag(0.28),
          }}
        >
          {CTA_LABEL}
        </button>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid var(--gray-100)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--ink-700)",
            opacity: open ? 1 : 0,
            transition: stag(0.32),
          }}
        >
          <span>Language</span>
          <span style={{ color: "var(--ink-500)" }}>English</span>
        </div>
        <div
          style={{
            marginTop: "auto",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 19,
            letterSpacing: "var(--tracking-display)",
            color: "var(--blue-electric)",
            opacity: open ? 1 : 0,
            transition: stag(0.36),
          }}
        >
          If You Don’t Want to Do It, ScrewIt!
        </div>
      </aside>
    </>
  );
}
