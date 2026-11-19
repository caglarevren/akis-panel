// Palette offered in the "new client" dialog. White initials must stay
// readable on every color in both themes.
export const BRAND_COLORS = [
  "#C2410C",
  "#1D4ED8",
  "#0F766E",
  "#0E7490",
  "#4D7C0F",
  "#57534E",
  "#A16207",
  "#BE185D",
] as const;

export type BrandColor = (typeof BRAND_COLORS)[number];

export function isBrandColor(value: string): value is BrandColor {
  return (BRAND_COLORS as readonly string[]).includes(value);
}
