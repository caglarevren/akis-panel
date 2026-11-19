import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en", "ru", "de"],
  defaultLocale: "tr",
  localePrefix: "always",
});
