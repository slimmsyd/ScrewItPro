/**
 * The home page's FAQ, derived from the English dictionary so the FAQPage
 * JSON-LD and the rendered accordion can never drift apart.
 *
 * `HOME_FAQ_COUNT` is the one place the count lives — components/home/FAQ.tsx
 * imports it rather than hardcoding a length.
 *
 * English only: LocaleProvider defaults to `en`, and Spanish appears only after
 * a client-side hydration from localStorage, so crawlers always see `en`. There
 * are no localized routes to mark up.
 */

import { en } from "@/i18n/dictionaries/en";
import type { Faq } from "@/lib/seo/schema";

export const HOME_FAQ_COUNT = 10;

export const HOME_FAQS: readonly Faq[] = Array.from(
  { length: HOME_FAQ_COUNT },
  (_, i) => ({
    q: en.faq[`q${i + 1}` as keyof typeof en.faq],
    a: en.faq[`a${i + 1}` as keyof typeof en.faq],
  })
);
