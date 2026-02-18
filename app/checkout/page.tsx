import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';

export default function CheckoutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />
      <section className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <h1 className="text-center text-[clamp(3rem,6vw,6rem)] leading-[0.92] text-[#E61E6E] font-coolvetica">
          Checkout
        </h1>
        <p className="mx-auto mt-6 max-w-[920px] text-center text-[clamp(1.8rem,3vw,3.4rem)] leading-[1.08] text-[#2E2A2A] font-schoolbell">
          placeholder for payment gateway integration.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
