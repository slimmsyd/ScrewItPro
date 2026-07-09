import type { Locale } from "@/i18n/config";
import { en, type Dictionary } from "./en";
import { es } from "./es";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
