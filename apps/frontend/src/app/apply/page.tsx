import type { Metadata } from "next";
import ApplyPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Apply for a loan — Shohoj Rin",
  description:
    "A short, plain-language application. Review every cost before you submit.",
  openGraph: {
    title: "Apply for a loan — Shohoj Rin",
    description:
      "A short, plain-language application. Review every cost before you submit.",
  },
};

export default function Page() {
  return <ApplyPageClient />;
}
