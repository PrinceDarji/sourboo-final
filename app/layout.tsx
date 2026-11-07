import { Suspense } from 'react';
import Script from 'next/script';
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

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`}
            </Script>
          </>
        ) : null}
        {metaPixelId ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(metaPixelId)});
fbq('track', 'PageView');`}
          </Script>
        ) : null}
        <Suspense fallback={null}><PopupSettings /></Suspense>
        <SectionScrollReveal />
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
