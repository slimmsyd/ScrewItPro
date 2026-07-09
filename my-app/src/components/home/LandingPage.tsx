"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplashLoader from "@/components/home/SplashLoader";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Nav from "@/components/home/Nav";
import MobileMenu from "@/components/home/MobileMenu";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Services from "@/components/home/Services";
import WhyUs from "@/components/home/WhyUs";
import Audiences from "@/components/home/Audiences";
import ServiceArea from "@/components/home/ServiceArea";
import FAQ from "@/components/home/FAQ";
import Credibility from "@/components/home/Credibility";
import Footer from "@/components/home/Footer";
import SupportChat from "@/components/home/SupportChat";
import { useIsMobile } from "@/hooks/useIsMobile";
import { isWaitlist, JOIN_PATH } from "@/lib/site";

/**
 * Full marketing landing page - ports design handoff
 * (ui_kits/website/index.html + sections-*.jsx).
 * Assets: /public/assets/* · Tokens: globals.css · Motion: Framer Motion Reveal + marquee CSS
 */
export default function LandingPage() {
 const router = useRouter();
 const mobile = useIsMobile();
 const [menuOpen, setMenuOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
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

 const id = setInterval(() => {
 p = Math.min(100, p + (Math.random() * 15 + 7));
 setProgress(p);
 if (p >= 100) {
 clearInterval(id);
 setTimeout(() => setExiting(true), 280);
 setTimeout(() => {
 setLoading(false);
 document.body.style.overflow = "";
 }, 280 + 940);
 }
 }, 195);

 return () => {
 clearInterval(id);
 document.body.style.overflow = "";
 };
 }, []);

 useEffect(() => {
 if (!mobile) setMenuOpen(false);
 }, [mobile]);

 const onCta = () => {
 if (isWaitlist) {
 router.push(JOIN_PATH);
 return;
 }
 // Future: open quote dialog
 };

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
 {isWaitlist && <AnnouncementBar />}
 <Nav
 onCta={onCta}
 onToggleMenu={() => setMenuOpen((o) => !o)}
 menuOpen={menuOpen}
 scrolled={scrolled}
 />
 </div>

 <div
 id="app-shell"
 className={mobile && menuOpen ? "peek" : undefined}
 >
 <div style={{ height: isWaitlist ? 110 : 72 }} />
 <Hero onCta={onCta} />
 <HowItWorks onCta={onCta} />
 <Services />
 <WhyUs />
 <Audiences />
 <ServiceArea />
 <FAQ />
 <Credibility onCta={onCta} />
 <Footer />
 </div>

 {mobile && (
 <MobileMenu
 open={menuOpen}
 onClose={() => setMenuOpen(false)}
 onCta={onCta}
 waitlist={isWaitlist}
 />
 )}

 {/* Chip concierge - launcher_handoff + support-chat flow */}
 <SupportChat />
 </div>
 );
}
