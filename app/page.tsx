import HomePage from './home/page';
import type { Metadata } from 'next';

const homeTitle = 'Sourboo | Spicy Sour Gherkin Snacks & Pickled Snacks';
const homeDescription =
  'Sourboo makes spicy-sour gherkin snacks and snackable pickles for people obsessed with tangy munchies, cocktails and bold snacking. Perfect for burgers, sandwiches and cocktail garnishes.';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: '/',
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

export default function Page() {
  return <HomePage />;
}
