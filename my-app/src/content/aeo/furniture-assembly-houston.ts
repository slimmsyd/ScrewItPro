/**
 * Copy for /furniture-assembly-pickup-delivery-houston.
 *
 * Per docs/ScrewIt_Pros_Houston_AEO_Schema_Spec.docx. English-only and authored
 * here rather than in the i18n dictionaries: the wording is tuned to the exact
 * English query ("furniture assembly with pickup and delivery in Houston"), and
 * there are no localized routes for a translation to be indexed on.
 *
 * `faqs` is the single source for both the rendered accordion and the FAQPage
 * JSON-LD — the page and the schema builder consume this same array. Never
 * re-type these strings anywhere; schema text that drifts from visible text is
 * exactly what Google penalizes.
 */

import { isWaitlist, JOIN_PATH } from "@/lib/site";
import type { Faq } from "@/lib/seo/schema";

export const HOUSTON_ASSEMBLY_PAGE = {
  eyebrow: "Houston · Pickup, assembly & delivery",

  h1: "Furniture Assembly with Pickup & Delivery in Houston",

  /**
   * The literal first text after the H1. Must stay two sentences: answer engines
   * lift the opening of a page as the answer, so nothing decorative goes above it.
   */
  answer:
    "ScrewIt Pros assembles furniture from any retailer and delivers it to you fully built: we pick it up from your home, store, or our workshop, assemble it by trained, background-checked pros, and bring it back ready to use. We serve the greater Houston metro area, with assembly starting at $49 and most orders finished in 24 to 72 hours.",

  facts: ["From $49", "24–72 hr turnaround", "Houston metro"],

  metaDescription:
    "ScrewIt Pros picks up your furniture anywhere in the Houston metro, assembles it in our workshop by background-checked pros, and delivers it fully built. From $49, done in 24–72 hours.",

  proof: {
    title: "Why people hand us the boxes",
    items: [
      {
        title: "Build Protection Guarantee",
        body: "Every order is covered. If something isn't right with the build, we make it right.",
        tone: "success" as const,
      },
      {
        title: "Multi-point inspection",
        body: "Every piece is photographed and checked against the manufacturer's spec before it leaves for delivery.",
        tone: "brand" as const,
      },
      {
        title: "Background-checked pros",
        body: "Workshop-trained assemblers who do this every day, not a rotating pool of gig labor.",
        tone: "brand" as const,
      },
      {
        title: "Workshop-first process",
        body: "No mess, no missing screws, no lost weekend. The build happens at our hub, not on your living room floor.",
        tone: "brand" as const,
      },
    ],
  },

  examples: {
    title: "What we assemble, and where it comes from",
    itemTypesLabel: "Item types",
    itemTypes: [
      "Beds",
      "Desks",
      "Dressers",
      "Tables",
      "Shelving",
      "Entertainment centers",
      "Office furniture",
      "Outdoor furniture",
    ],
    retailersLabel: "Retailers",
    retailers: [
      "IKEA",
      "Wayfair",
      "Amazon",
      "Target",
      "Walmart",
      "Costco",
      "Ashley",
      "Crate & Barrel",
    ],
    retailerNote:
      "Any retailer: these are just the ones we see most. Retailer names are used for identification only; ScrewIt Pros is not affiliated with or endorsed by these companies.",
  },

  comparison: {
    title: "Workshop assembly vs. an in-home assembler",
    caption:
      "ScrewIt Pros compared with a typical in-home furniture assembler in Houston.",
    themColumn: "Typical in-home assembler",
    usColumn: "ScrewIt Pros",
    rows: [
      {
        feature: "Where it's built",
        them: "On your living room floor",
        us: "In our dedicated workshop",
      },
      {
        feature: "Mess in your home",
        them: "Boxes, tools, packaging",
        us: "None, delivered ready",
      },
      {
        feature: "Pickup included",
        them: "Usually no",
        us: "Yes, door to door",
      },
      {
        feature: "Quality check",
        them: "Varies",
        us: "Multi-point inspection + photos",
      },
      {
        feature: "Guarantee",
        them: "Often none",
        us: "Build Protection Guarantee",
      },
      {
        feature: "Your weekend",
        them: "Spent waiting",
        us: "Free",
      },
    ],
  },

  faqTitle: "Questions people ask before booking",

  faqs: [
    {
      q: "Do you pick up and deliver furniture in Houston?",
      a: "Yes. We pick up your furniture from your home, store, or receive it directly at our workshop, assemble it by trained pros, and deliver it fully built across the Houston metro area.",
    },
    {
      q: "How much does furniture assembly with pickup and delivery cost?",
      a: "Assembly starts at $49 and varies by size and complexity. Pickup and delivery are handled door to door, and you can get an instant quote in about 60 seconds.",
    },
    {
      q: "How long does pickup, assembly, and delivery take?",
      a: "Most orders are completed within 24 to 72 hours from pickup to delivery.",
    },
    {
      q: "Which retailers do you assemble furniture from?",
      a: "Any retailer, including IKEA, Wayfair, Amazon, Target, Walmart, Costco, Ashley, and Crate & Barrel.",
    },
    {
      q: "What areas of Houston do you serve?",
      a: "We serve the greater Houston metro area, including Katy, Sugar Land, The Woodlands, Pearland, Cypress, and Spring, with more neighborhoods on the way.",
    },
    {
      q: "What if my furniture arrives damaged?",
      a: "We inspect every item when we receive it and notify you immediately if damage is found before assembly begins. Your furniture is also covered by our Build Protection Guarantee.",
    },
  ] as const satisfies readonly Faq[],

  cta: {
    title: "Hand us the boxes.",
    body: "Tell us what you bought and where it is. We'll handle pickup, the build, and delivery.",
    /**
     * Labels track SITE_MODE. While the site is in waitlist mode the quote flow
     * does not exist (see components/home/QuoteDialog.tsx), so the primary CTA
     * must not promise one. These self-correct to the spec's wording at launch.
     */
    primary: isWaitlist
      ? { label: "Get on the Houston list (60 seconds)", href: JOIN_PATH }
      : { label: "Get an instant quote (60 seconds)", href: JOIN_PATH },
    secondary: isWaitlist
      ? { label: "See how it works", href: "/#how" }
      : { label: "Join the Houston waitlist", href: JOIN_PATH },
  },

  service: {
    name: "Furniture Assembly with Pickup and Delivery in Houston",
    serviceType: "Furniture assembly, pickup, and delivery",
    description:
      "We pick up your furniture from any retailer, assemble it in our workshop, and deliver it fully built and inspected across the Houston metro area.",
  },
} as const;
