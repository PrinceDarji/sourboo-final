import { rascal, coolvetica, schoolbell } from "./fonts";
import "./globals.css";
import CartRoot from './components/cart/CartRoot';
import SectionScrollReveal from './components/SectionScrollReveal';
import LandingPopupRedirect from './components/popup/LandingPopupRedirect';
import { getLandingPopupContent } from '@/src/lib/sanity/landingPopup';

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
        />
        <SectionScrollReveal />
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
