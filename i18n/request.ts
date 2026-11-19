import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { APP_TIME_ZONE } from "@/lib/dates";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // The agency works in Turkey; dates (publish days, "today", activity
    // times) must not depend on the server's time zone.
    timeZone: APP_TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
