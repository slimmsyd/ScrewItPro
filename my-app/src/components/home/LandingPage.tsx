"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import QuoteDialog from "@/components/home/QuoteDialog";
import SupportChat from "@/components/home/SupportChat";
import { useIsMobile } from "@/hooks/useIsMobile";
import { isWaitlist, JOIN_PATH } from "@/lib/site";

/**
 * Full marketing landing page - V2 design.
 * Order: Hero → Audiences → HowItWorks → Services → WhyUs → AudiencesPhoto →
 * ServiceArea → FAQ → Credibility → Footer. Nav carries a desktop utility bar;
 * the mobile announcement bar only shows in waitlist mode.
 * Assets: /public/assets/* · Tokens: globals.css · Motion: Framer Motion + CSS.
 */
export default function LandingPage() {
  const router = useRouter();
  const mobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

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

    if (reduce) {
      setProgress(100);
      setExiting(true);
      const t = setTimeout(() => {
        setLoading(false);
        document.body.style.overflow = "";
      }, 300);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    // ~2.5–3s progress so the bar is readable, then brief hold + exit.
    const id = setInterval(() => {
      p = Math.min(100, p + (Math.random() * 8 + 5));
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setExiting(true), 420);
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "";
        }, 420 + 940);
      }
    }, 260);

    return () => {
      clearInterval(id);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  const onQuote = () => {
    if (isWaitlist) {
      router.push(JOIN_PATH);
      return;
    }
    setQuoteOpen(true);
  };

  // Fixed header height: desktop = utility + nav; mobile = announce strip + nav
  // (slight buffer so hero media never sits under the bar)
  const headerHeight = mobile ? 104 : 114;

  return (
    <div>
      {loading && <SplashLoader progress={progress} exiting={exiting} />}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        {/* Mobile strip matches desktop TopUtilityBar (MVP pill + announce) */}
        {mobile && <AnnouncementBar waitlist={isWaitlist} />}
        <Nav
          onQuote={onQuote}
          onToggleMenu={() => setMenuOpen((o) => !o)}
          menuOpen={menuOpen}
          scrolled={scrolled}
          waitlist={isWaitlist}
        />
      </div>

      <div id="app-shell" className={mobile && menuOpen ? "peek" : undefined}>
        <div style={{ height: headerHeight }} />
        <Hero onQuote={onQuote} waitlist={isWaitlist} />
        <DividerBand />
        <Differentiators />
        <Audiences />
        <HowItWorks />
        <Services />
        <WhyUs />
        <AudiencesPhoto />
        <ServiceArea />
        <FAQ onQuote={onQuote} waitlist={isWaitlist} />
        <Credibility onQuote={onQuote} waitlist={isWaitlist} />
        <Footer />
      </div>

      {mobile && (
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onQuote={onQuote}
          waitlist={isWaitlist}
        />
      )}

      <QuoteDialog
        key={quoteOpen ? "quote-open" : "quote-closed"}
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        waitlist={isWaitlist}
      />

      {/* Chip concierge */}
      <SupportChat />
    </div>
  );
}
