import type { TranslationKey } from "../translations/en";

/** Safely maps a backend enum value to a translation key, falling back to the
 *  raw value if no mapping exists (never throws on unknown/new enum values). */
export function enumKey(prefix: string, value: string): TranslationKey {
  return `${prefix}.${value}` as TranslationKey;
}
