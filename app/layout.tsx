import { rascal, coolvetica, schoolbell } from "./fonts";
import "./globals.css";
import CartRoot from './components/cart/CartRoot';
import SectionScrollReveal from './components/SectionScrollReveal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rascal.variable} ${coolvetica.variable} ${schoolbell.variable}`}
    >
      <body>
        <SectionScrollReveal />
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
