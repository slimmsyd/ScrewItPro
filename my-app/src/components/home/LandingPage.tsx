"use client";

import { useEffect, useState } from "react";
import SplashLoader from "@/components/home/SplashLoader";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Nav from "@/components/home/Nav";
import MobileMenu from "@/components/home/MobileMenu";
import Hero from "@/components/home/Hero";
import DividerBand from "@/components/home/DividerBand";
import Differentiators from "@/components/home/Differentiators";
import Audiences from "@/components/home/Audiences";
import HowItWorks from "@/components/home/HowItWorks";
import Services from "@/components/home/Services";
import WhyUs from "@/components/home/WhyUs";
import AudiencesPhoto from "@/components/home/AudiencesPhoto";
import ServiceArea from "@/components/home/ServiceArea";
import FAQ from "@/components/home/FAQ";
import Credibility from "@/components/home/Credibility";
import Footer from "@/components/home/Footer";
import SupportChat from "@/components/home/SupportChat";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrimaryCta } from "@/hooks/usePrimaryCta";
import { isWaitlist, QUOTE_PATH } from "@/lib/site";
import { useRouter } from "next/navigation";

/**
 * Full marketing landing page - V2 design.
 * Order: Hero → Audiences → HowItWorks → Services → WhyUs → AudiencesPhoto →
 * ServiceArea → FAQ → Credibility → Footer. Nav carries a desktop utility bar;
 * the mobile announcement bar only shows in waitlist mode.
 * Assets: /public/assets/* · Tokens: globals.css · Motion: Framer Motion + CSS.
 */
export default function LandingPage() {
  const mobile = useIsMobile();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const primaryCta = usePrimaryCta({
    onQuote: () => router.push(QUOTE_PATH),
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let p = 0;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Mobile: ~20% faster splash so first paint feels snappier on small screens
    const isMobileSplash =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    const speed = isMobileSplash ? 0.8 : 1;
    const tickMs = Math.round(260 * speed);
    const holdMs = Math.round(420 * speed);
    const exitMs = Math.round(940 * speed);
    const stepScale = isMobileSplash ? 1.25 : 1;

    if (reduce) {
      setProgress(100);
      setExiting(true);
      const t = setTimeout(() => {
        setLoading(false);
        document.body.style.overflow = "";
      }, Math.round(300 * speed));
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    // ~2.5-3s desktop; ~20% quicker on mobile, then brief hold + exit.
    const id = setInterval(() => {
      p = Math.min(100, p + (Math.random() * 8 + 5) * stepScale);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setExiting(true), holdMs);
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "";
        }, holdMs + exitMs);
      }
    }, tickMs);

    return () => {
      clearInterval(id);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  const onPrimaryCta = () => {
    void primaryCta.run();
  };

  // Fixed header height: desktop = utility + nav; mobile = announce strip + nav
  // (slight buffer so hero media never sits under the bar)
  const headerHeight = mobile ? 104 : 114;

  return (
    <div>
      {loading && <SplashLoader progress={progress} exiting={exiting} />}

      {primaryCta.shareFeedback && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            background: "var(--blue-deep)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
            padding: "12px 18px",
            borderRadius: "var(--radius-pill)",
            boxShadow: "0 10px 30px rgba(4, 32, 155, 0.25)",
            maxWidth: "min(92vw, 360px)",
            textAlign: "center",
          }}
        >
          {primaryCta.shareFeedback}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          // Solid stack — never a translucent layer over the page
          background: "var(--white)",
          // No filter inheritance / frosted sampling into page content
          isolation: "isolate",
        }}
      >
        {/* Mobile strip matches desktop TopUtilityBar (MVP pill + announce) */}
        {mobile && <AnnouncementBar waitlist={isWaitlist} />}
        <Nav
          onQuote={onPrimaryCta}
          ctaLabel={primaryCta.label}
          onToggleMenu={() => setMenuOpen((o) => !o)}
          menuOpen={menuOpen}
          scrolled={scrolled}
          waitlist={isWaitlist}
        />
      </div>

      <div id="app-shell" className={mobile && menuOpen ? "peek" : undefined}>
        <div style={{ height: headerHeight }} />
        <Hero
          onQuote={onPrimaryCta}
          waitlist={isWaitlist}
          ctaLabel={primaryCta.label}
        />
        <DividerBand />
        <Differentiators />
        <Audiences />
        <HowItWorks />
        <Services />
        <WhyUs />
        <AudiencesPhoto />
        <ServiceArea />
        <FAQ
          onQuote={onPrimaryCta}
          waitlist={isWaitlist}
          ctaLabel={primaryCta.label}
        />
        <Credibility
          onQuote={onPrimaryCta}
          waitlist={isWaitlist}
          ctaLabel={primaryCta.label}
        />
        <Footer />
      </div>

      {mobile && (
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onQuote={onPrimaryCta}
          ctaLabel={primaryCta.label}
          waitlist={isWaitlist}
        />
      )}

      {/* Chip concierge */}
      <SupportChat />
    </div>
  );
}
