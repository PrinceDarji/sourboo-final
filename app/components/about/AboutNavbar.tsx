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

  return (
    <nav className="pointer-events-none fixed left-0 right-0 top-0 z-50 w-full px-2 pt-1 sm:px-4 md:px-6">
      <div className="relative mx-auto w-full max-w-[1520px]">
        <div className="relative h-[76px] w-full overflow-hidden sm:h-[86px] md:h-[96px] lg:h-[106px]">
          <Image
            src="/navbody.svg"
            alt="Navigation background"
            fill
            priority
            className="pointer-events-none select-none object-cover object-center"
          />

          <div className="pointer-events-auto absolute left-1/2 top-[5%] z-20 -translate-x-1/2">
            <Link href="/" className="block">
              <div className="relative h-[28px] w-[96px] sm:h-[34px] sm:w-[116px] md:h-[42px] md:w-[142px] lg:h-[50px] lg:w-[170px]">
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

          <div className="absolute inset-x-[7%] top-[58%] z-20 flex items-center justify-between sm:inset-x-[8%] sm:top-[58%] md:inset-x-[9%] md:top-[60%]">
            <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4 md:gap-7 lg:gap-10">
              {leftLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap text-[clamp(0.72rem,1.1vw,1.22rem)] leading-none text-[#E9E6B8] transition-opacity hover:opacity-80 font-schoolbell"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4 md:gap-7 lg:gap-10">
              {rightLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap text-[clamp(0.72rem,1.1vw,1.22rem)] leading-none text-[#E9E6B8] transition-opacity hover:opacity-80 font-schoolbell"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={openCart}
                className="whitespace-nowrap text-[clamp(0.72rem,1.1vw,1.22rem)] leading-none text-[#E9E6B8] transition-opacity hover:opacity-80 font-schoolbell"
              >
                cart{totalItems > 0 ? ` (${totalItems})` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
