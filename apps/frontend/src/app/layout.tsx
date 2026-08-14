import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import "../styles.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shohoj_Rin — Simple, transparent borrowing",
  description:
    "Shohoj_Rin helps first-time borrowers discover loans, understand every term, and manage repayments with total clarity.",
  authors: [{ name: "Shohoj_Rin" }],
  openGraph: {
    title: "Shohoj_Rin — Simple, transparent borrowing",
    description:
      "Discover loans that fit your life, understand every term clearly, and manage repayments without stress.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
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
