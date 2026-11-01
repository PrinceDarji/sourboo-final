import { Suspense } from 'react';
import { rascal, coolvetica, schoolbell } from "./fonts";
import "./globals.css";
import CartRoot from './components/cart/CartRoot';
import SectionScrollReveal from './components/SectionScrollReveal';
import LandingPopupRedirect from './components/popup/LandingPopupRedirect';
import { getLandingPopupContent } from '@/src/lib/sanity/landingPopup';
import { siteUrl } from '@/src/lib/siteUrl';
import type { Metadata } from "next";

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

async function PopupSettings() {
  const landingPopup = await getLandingPopupContent(300);
  return <LandingPopupRedirect enabled={landingPopup.enabled} delaySeconds={landingPopup.delaySeconds} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html
      lang="en"
      className={`${rascal.variable} ${coolvetica.variable} ${schoolbell.variable}`}
    >
      <body>
        <Suspense fallback={null}><PopupSettings /></Suspense>
        <SectionScrollReveal />
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
