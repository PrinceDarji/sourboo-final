'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import InstagramPostsStrip from './InstagramPostsStrip';

const primaryLinks = [
  { label: 'HOME', href: '/' },
  { label: 'OUR STORY', href: '/about' },
];

const secondaryLinks = [
  { label: 'SHOP', href: '/product' },
  { label: 'JOIN US', href: '/join' },
];

const policyLinks = [
  { label: 'TERMS & CONDITIONS', href: '/terms-and-conditions' },
  { label: 'PRIVACY POLICY', href: '/privacy-policy' },
  { label: 'REFUND POLICY', href: '/refund-policy' },
  { label: 'SHIPPING POLICY', href: '/shipping-policy' },
  { label: 'CONTACT', href: '/contact' },
];

function normalizePath(path: string) {
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

type FooterLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

function FooterLink({ href, className, children }: FooterLinkProps) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname || '/');
  const targetPath = normalizePath(href);
  const isCurrentPage = currentPath === targetPath;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isCurrentPage) return;
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="w-full overflow-x-hidden">
      <InstagramPostsStrip />

      <div className="w-full">
        <div className="relative aspect-[1932/1324] w-full md:hidden">
          <Image
            src="/footerbod.svg"
            alt=""
            fill
            aria-hidden
            className="object-fill"
          />

          <div className="absolute inset-x-[2.8%] bottom-[2.8%] top-[2.4%]">
            <div className="absolute left-1/2 top-[3%] w-[clamp(40px,30vw,150px)] -translate-x-1/2 rounded-[14px] px-2 py-2 text-center">
              <p className="text-[clamp(0.46rem,2.8vw,1.06rem)] leading-[1.05] text-[#232222] font-schoolbell">
                DO YOU EVEN REMEMBER HOW IT STARTED
              </p>
              <p className="mt-2 text-[clamp(1.06rem,4.8vw,1.5rem)] leading-none text-[#E61E7A] font-rascal">
                stay sour
              </p>
            </div>

            <div className="absolute inset-x-[10%] top-[35%] grid grid-cols-2">
              <div className="flex flex-col items-start gap-8">
                {primaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(0.75rem,3.7vw,1.12rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>

              <div className="flex flex-col items-end gap-8">
                {secondaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(0.75rem,3.7vw,1.12rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div className="absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2">
              <div
                className="pointer-events-none absolute left-1/2 top-[58%] h-[24px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-[48%_52%_53%_47%/60%_44%_56%_40%] bg-[#CDD58D]/85"
                aria-hidden
              />
              <div className="relative h-[32px] w-[156px]">
                <Image
                  src="/logo.svg"
                  alt="Sourboo logo"
                  fill
                  className="object-contain object-center"
                />
              </div>
            </div>

            <div className="absolute inset-x-[7%] bottom-[8.5%] top-[82%]">
              <div className="grid h-full grid-cols-5 items-center gap-x-1.5">
                {policyLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className="text-center text-[clamp(0.52rem,1.9vw,0.7rem)] leading-[0.9] text-[#1F1F1F] font-coolvetica transition hover:opacity-75"
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden h-[clamp(440px,64vw,860px)] w-full md:block">
          <Image
            src="/footerbod.svg"
            alt=""
            fill
            aria-hidden
            className="object-fill"
          />

          <div className="absolute inset-x-[2.5%] bottom-[3%] top-[22%] flex flex-col">
            <div className="absolute left-1/2 top-[-12%] w-[180px] -translate-x-1/2 rounded-[14px] bg-[#FCE7F3] px-2 py-3 text-center sm:w-[220px] md:w-[265px]">
              <p className="text-[clamp(1.08rem,1.3vw,1.58rem)] leading-[1.05] text-[#232222] font-schoolbell">
                DO YOU EVEN REMEMBER HOW IT STARTED
              </p>
              <p className="mt-3 text-[clamp(1.16rem,1.65vw,2rem)] leading-none text-[#E61E7A] font-rascal">
                stay sour
              </p>
            </div>

            <div className="grid grid-cols-2 items-start px-[8.5%] pt-[18%] sm:px-[9.5%] sm:pt-[15%] md:px-[10.5%] md:pt-[13%]">
              <div className="flex flex-col items-start gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {primaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(1.1rem,2vw,2.2rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>

              <div className="flex flex-col items-end gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {secondaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(1.1rem,2vw,2.2rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div className="relative mt-auto pb-[0.8%]">
              <div className="relative -translate-y-[10%] px-[6%] pb-[4.4%] pt-[2.6%] sm:-translate-y-[9%] md:-translate-y-[80%]">
                <div
                  className="pointer-events-none absolute left-1/2 top-[34%] h-[42%] w-[45%] -translate-x-1/2 rounded-[48%_52%_53%_47%/60%_44%_56%_40%] bg-[#CDD58D]/85"
                  aria-hidden
                />

                <div className="relative mx-auto h-[52px] w-[180px] sm:h-[66px] sm:w-[230px] md:h-[84px] md:w-[300px] lg:h-[94px] lg:w-[340px]">
                  <Image
                    src="/logo.svg"
                    alt="Sourboo logo"
                    fill
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-[6.5%] bottom-[10.1%] top-[81.5%] sm:inset-x-[6%] md:inset-x-[5.5%]">
            <div className="grid h-full grid-cols-5 items-center gap-x-2 px-1 sm:gap-x-3 sm:px-2 md:px-4">
              {policyLinks.map((item) => (
                <FooterLink
                  key={item.label}
                  href={item.href}
                  className="text-center text-[clamp(0.62rem,0.95vw,1.05rem)] leading-[0.95] text-[#1F1F1F] font-coolvetica transition hover:opacity-75"
                >
                  {item.label}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
