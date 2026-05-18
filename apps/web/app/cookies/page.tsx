/* <!-- TODO: review with counsel --> */
import { buildMetadata } from "@/lib/metadata";
import { CookiesPageClient } from "./CookiesPageClient";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/cookies",
  title: "Cookie Policy",
  description: "Cookie policy for quickhelp.dev — what we store and how to manage your preferences.",
  noindex: true,
});

export default function CookiesPage() {
  return <CookiesPageClient />;
}
