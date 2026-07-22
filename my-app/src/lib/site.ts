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
  audiencesCrew: "/assets/team-community.png",
  /** Shared brand mark for favicons / fallbacks (deep blue S) */
  brandIcon: "/assets/logo-icon-deep-blue.png",
} as const;

export const CTA_LABEL = isWaitlist ? "Join Now" : "Get a Free Quote";
export const JOIN_PATH = "/join";
/** Get-a-Price quote journey (Where → What → Price). */
export const QUOTE_PATH = "/quote/where";
export const QUOTE_ITEMS_PATH = "/quote/items";
export const QUOTE_PRICE_PATH = "/quote/price";
/** AEO landing page targeting "furniture assembly with pickup and delivery in Houston". */
export const HOUSTON_ASSEMBLY_PATH = "/furniture-assembly-pickup-delivery-houston";
export const PRIVACY_PATH = "/privacy";
export const TERMS_PATH = "/terms";
