'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/components/cart/CartProvider';

const leftLinks = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
  { href: '/product', label: 'product' },
];

const rightLinks = [
  { href: '/join', label: 'join us' },
];

export default function Navbar() {
  const { openCart, totalItems } = useCart();
  const navItemClass =
    'group relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[clamp(0.72rem,1.1vw,1.22rem)] leading-none text-[#E9E6B8] transition-colors duration-200 hover:bg-[#E9E6B8]/16 hover:text-[#FFFBD8] focus-visible:bg-[#E9E6B8]/22 focus-visible:text-[#FFFBD8] focus-visible:outline-none font-schoolbell';
  const navItemBlobClass =
    'pointer-events-none absolute inset-x-[-0.4rem] inset-y-[-0.3rem] -z-10 scale-75 rounded-[48%_52%_53%_47%/60%_44%_56%_40%] bg-[#E9E6B8]/24 opacity-0 blur-[0.6px] transition-all duration-250 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100';

  return (
    <nav className="pointer-events-none fixed left-0 right-0 -top-10 z-50 w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="relative mx-auto hidden w-full max-w-[1120px] lg:block xl:max-w-[1240px] 2xl:max-w-[1320px]">
        <div className="relative aspect-[1440/260] w-full overflow-hidden">
          <div className="absolute inset-0 -translate-y-[8%] scale-[1.06] origin-top">
            <Image
              src="/navbar.svg"
              alt="Navigation"
              fill
              priority
              className="pointer-events-none select-none object-contain object-center"
            />
            <div className="absolute inset-x-[8%] top-[50%] z-20 flex items-center justify-between">
              <div className="pointer-events-auto flex items-center gap-5 xl:gap-8">
                {leftLinks.map((item) => (
                  <Link key={item.label} href={item.href} className={navItemClass}>
                    <span aria-hidden className={navItemBlobClass} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pointer-events-auto flex items-center gap-5 xl:gap-8">
                {rightLinks.map((item) => (
                  <Link key={item.label} href={item.href} className={navItemClass}>
                    <span aria-hidden className={navItemBlobClass} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
                <button type="button" onClick={openCart} className={navItemClass}>
                  <span aria-hidden className={navItemBlobClass} />
                  <span className="relative z-10">cart{totalItems > 0 ? ` (${totalItems})` : ''}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1520px] lg:hidden">
        <div className="relative h-[100px] w-full overflow-hidden sm:h-[112px] md:h-[124px]">
          <Image
            src="/navbody.svg"
            alt="Navigation background"
            fill
            priority
            className="pointer-events-none select-none object-cover object-center"
          />

          <div className="pointer-events-auto absolute left-1/2 top-[6%] z-20 -translate-x-1/2">
            <Link href="/" className="block">
              <div className="relative h-[54px] w-[188px] sm:h-[62px] sm:w-[216px] md:h-[74px] md:w-[258px]">
                <Image
                  src="/navlogo.svg"
                  alt="Sourboo logo"
                  fill
                  priority
                  className="object-contain object-center"
                />
              </div>
            </Link>
          </div>

          <div className="absolute inset-x-[7%] top-[50%] z-20 flex items-center justify-between sm:inset-x-[8%] sm:top-[67%] md:inset-x-[9%] md:top-[69%]">
            <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4 md:gap-7">
              {leftLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={navItemClass}
                >
                  <span aria-hidden className={navItemBlobClass} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4 md:gap-7">
              {rightLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={navItemClass}
                >
                  <span aria-hidden className={navItemBlobClass} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
              <button
                type="button"
                onClick={openCart}
                className={navItemClass}
              >
                <span aria-hidden className={navItemBlobClass} />
                <span className="relative z-10">cart{totalItems > 0 ? ` (${totalItems})` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
