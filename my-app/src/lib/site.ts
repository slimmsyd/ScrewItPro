/** Site-wide config. Waitlist is the beta launch mode per design handoff. */
export const SITE_MODE = "waitlist" as const; // "waitlist" | "quote"

export const isWaitlist = SITE_MODE === "waitlist";

export const ASSETS = {
  logoS: "/assets/logo-icon-s.png",
  logoSWhite: "/assets/logo-s-white.png",
  logoWordmark: "/assets/logo-primary-full-color.jpg",
  logoDeep: "/assets/logo-icon-deep-blue.png",
  logoElectric: "/assets/logo-icon-electric-blue.jpg",
  mascot: "/assets/mascot-wave.jpg",
  audiencesCrew: "/assets/audiences-crew.jpg",
} as const;

export const CTA_LABEL = isWaitlist ? "Join Now" : "Get a Free Quote";
export const JOIN_PATH = "/join";
