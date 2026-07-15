"use client";

import { useEffect, useRef } from "react";
import HeroAddressBar from "@/components/home/HeroAddressBar";
import Container from "@/components/ui/Container";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

// Cache-bust after white-bg re-encode
const HERO_VIDEO_SRC = "/assets/hero-loop.mp4?v=4";
const HERO_POSTER_SRC = "/assets/hero-loop-poster.jpg?v=4";

/**
 * V2 hero: full-width copy + address bar. Looping truck video is decorative
 * (absolute, out of flow) so it never shifts text/UI.
 *
 * Autoplay notes:
 * - Browsers only allow muted + playsInline autoplay.
 * - We set the muted *property* (not only the attribute) - React's muted prop
 *   alone is unreliable for the autoplay policy check.
 * - src is on <video> (not nested <source>) so load/play is deterministic.
 * - Marketing product loop always plays; a still poster is the fallback if
 *   play() is blocked. (OS "Reduce motion" no longer freezes this asset -
 *   that was why the truck looked stuck.)
 */
export default function Hero({
  onQuote,
  waitlist,
}: {
  onQuote: () => void;
  waitlist: boolean;
}) {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cta = waitlist ? t("hero.ctaWaitlist") : t("hero.ctaQuote");

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let cancelled = false;

    const ensureMuted = () => {
      el.defaultMuted = true;
      el.muted = true;
      el.volume = 0;
      // Attribute form for WebKit's autoplay policy check
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
    };

    const tryPlay = async () => {
      if (cancelled) return;
      ensureMuted();
      el.loop = true;
      el.playsInline = true;
      try {
        await el.play();
      } catch {
        // Retry once after the element finishes loading data
        if (cancelled) return;
        ensureMuted();
        try {
          await el.play();
        } catch {
          /* leave poster/first frame if autoplay is hard-blocked */
        }
      }
    };

    ensureMuted();

    // Kick load if the browser hasn't started yet
    if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      el.load();
    }

    void tryPlay();

    const onReady = () => {
      void tryPlay();
    };
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("canplay", onReady);
    el.addEventListener("canplaythrough", onReady);

    // After splash / tab return, nudge play again
    const onVisible = () => {
      if (document.visibilityState === "visible") void tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    // If something pauses it (Strict Mode remount races, splash, etc.), resume
    const onPause = () => {
      if (cancelled) return;
      // Don't fight an intentional end; loop should restart via `loop`
      if (el.ended) return;
      window.setTimeout(() => {
        if (!cancelled && el.paused) void tryPlay();
      }, 200);
    };
    el.addEventListener("pause", onPause);

    const watchdog = window.setInterval(() => {
      if (cancelled) return;
      if (el.paused && !el.ended) void tryPlay();
    }, 2000);

    return () => {
      cancelled = true;
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("canplaythrough", onReady);
      el.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(watchdog);
    };
  }, []);

  return (
    <header
      id="top"
      style={{
        background: "var(--white)",
        // Extra top pad on mobile so the video clears the fixed announce+nav
        padding: mobile ? "28px 0 40px" : "48px 0 72px",
        position: "relative",
        overflow: "visible",
        minHeight: mobile ? "auto" : "min(72vh, 760px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          ...(mobile
            ? {
                right: 0,
                left: 0,
                // Sit below the nav fold, not flush under the bar
                top: 24,
                height: 180,
              }
            : {
                // Use vh - % height against an auto-sized parent can collapse
                right: "-4%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "min(52vw, 720px)",
                height: "min(62vh, 540px)",
              }),
        }}
      >
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disableRemotePlayback
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: mobile ? "center" : "center right",
            display: "block",
            background: "transparent",
          }}
        />
      </div>

      <Container style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
            // Room for absolute mobile video band (top 24 + ~180) under the nav
            paddingTop: mobile ? 200 : "20%",
            paddingBottom: mobile ? 0 : "2%",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              // Mobile: larger type that wraps naturally (no nowrap overflow)
              fontSize: mobile
                ? "clamp(28px, 8.5vw, 40px)"
                : "var(--text-hero)",
              lineHeight: 1.1,
              letterSpacing: "var(--tracking-display)",
              color: "var(--text-heading)",
              margin: "0 0 20px",
              maxWidth: mobile ? "100%" : "18ch",
              whiteSpace: "normal",
              textWrap: mobile ? "balance" : undefined,
            }}
          >
            {t("hero.v2TitleA")}{" "}
            <span style={{ color: "var(--blue-electric)" }}>
              {t("hero.v2TitleAccent")}
            </span>{" "}
            <span style={{ color: "var(--ink-300)" }}>
              {t("hero.v2TitleB")}
            </span>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: mobile ? 17 : "var(--text-lg)",
              lineHeight: "var(--leading-body)",
              color: "var(--text-muted)",
              margin: "0 0 32px",
              maxWidth: "52ch",
            }}
          >
            {t("hero.v2Sub")}
          </p>

          <div style={{ width: "100%", maxWidth: 900 }}>
            <HeroAddressBar onQuote={onQuote} cta={cta} />
          </div>
        </div>
      </Container>
    </header>
  );
}
