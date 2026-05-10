import { rascal, coolvetica, schoolbell } from "./fonts";
import "./globals.css";
import CartRoot from './components/cart/CartRoot';
import SectionScrollReveal from './components/SectionScrollReveal';
import LandingPopupRedirect from './components/popup/LandingPopupRedirect';
import { getLandingPopupContent } from '@/src/lib/sanity/landingPopup';
import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.sourboo.com");

const siteName = "Sourboo";
const siteDescription =
  "Bold khatta snacks: sour, spicy, loud. Shop Side Eye Sour and Tamarind Tease from Sourboo.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const landingPopup = await getLandingPopupContent(0);

  return (
    <html
      lang="en"
      className={`${rascal.variable} ${coolvetica.variable} ${schoolbell.variable}`}
    >
      <body>
        <LandingPopupRedirect
          enabled={landingPopup.enabled}
          delaySeconds={landingPopup.delaySeconds}
        />
        <SectionScrollReveal />
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
