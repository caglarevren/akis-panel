import { notFound } from "next/navigation";

// Any address under a locale that matches no page lands here, so unknown URLs
// get the branded 404 (app/[locale]/not-found.tsx) instead of Next's default.
export default function UnknownPage() {
  notFound();
}
