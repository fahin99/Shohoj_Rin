import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "@fontsource/stack-sans-notch/500.css";
import "@fontsource/stack-sans-notch/600.css";
import "@fontsource/stack-sans-notch/700.css";
import { Providers } from "./providers";
import "../styles.css";
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Shohoj Rin — Simple, transparent borrowing",
  description:
    "Shohoj Rin helps first-time borrowers discover loans, understand every term, and manage repayments with total clarity.",
  authors: [{ name: "Shohoj Rin" }],
  openGraph: {
    title: "Shohoj Rin — Simple, transparent borrowing",
    description:
      "Discover loans that fit your life, understand every term clearly, and manage repayments without stress.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.svg",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[6px] focus:border-[1.5px] focus:border-navy focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-navy"
          >
            Skip to main content
          </a>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
