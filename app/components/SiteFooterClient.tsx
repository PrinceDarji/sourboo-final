'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import InstagramPostsStrip from './InstagramPostsStrip';
import type { FooterLink, InstagramPostLink } from '@/src/lib/sanity/siteSettings';

type SiteFooterClientProps = {
  instagram: {
    profileUrl: string;
    handle: string;
    posts: InstagramPostLink[];
    headingPrefix: string;
    fallbackCardLabel: string;
  };
  footer: {
    backgroundImageUrl?: string;
    logoImageUrl: string;
    logoAlt: string;
    tagline: string;
    primaryLinks: FooterLink[];
    secondaryLinks: FooterLink[];
    policyLinks: FooterLink[];
  };
};

const footerMaskStyle = {
  WebkitMaskImage: "url('/footerbod.svg')",
  maskImage: "url('/footerbod.svg')",
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
} as const;

const footerLinkClassName =
  'text-[clamp(0.75rem,3.7vw,1.12rem)] leading-none text-[#D7F557] font-coolvetica transition hover:opacity-80';

const footerDesktopLinkClassName =
  'text-[clamp(1.1rem,2vw,2.2rem)] leading-none text-[#D7F557] font-coolvetica transition hover:opacity-80';

const footerPolicyLinkClassName =
  'text-center text-[clamp(0.52rem,1.9vw,0.7rem)] leading-[0.9] text-[#D7F557] font-coolvetica transition hover:opacity-75';

const footerDesktopPolicyLinkClassName =
  'text-center text-[clamp(0.62rem,0.95vw,1.05rem)] leading-[0.95] text-[#D7F557] font-coolvetica transition hover:opacity-75';

type FooterBackgroundProps = {
  imageUrl?: string;
};

function FooterBackground({ imageUrl }: FooterBackgroundProps) {
  if (!imageUrl) {
    return (
      <Image
        src="/footerbod.webp"
        alt=""
        fill
        aria-hidden
        className="pointer-events-none object-fill blur-[3px]"
        sizes="100vw"
      />
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden bg-[#FCE7F3] [contain:paint]"
        style={footerMaskStyle}
        aria-hidden
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          aria-hidden
          className="scale-[1.02] object-cover object-center blur-[3px]"
          sizes="100vw"
        />
      </div>

      <Image
        src="/footerbod-overlay.svg"
        alt=""
        fill
        aria-hidden
        className="pointer-events-none object-fill"
        sizes="100vw"
      />
    </>
  );
}

function normalizePath(path: string) {
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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
    scrollToPageTop();
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default function SiteFooterClient({ instagram, footer }: SiteFooterClientProps) {
  return (
    <footer className="w-full overflow-x-hidden">
      <InstagramPostsStrip
        profileUrl={instagram.profileUrl}
        handle={instagram.handle}
        posts={instagram.posts}
        headingPrefix={instagram.headingPrefix}
        fallbackCardLabel={instagram.fallbackCardLabel}
      />

      <div className="w-full">
        <div className="relative aspect-[1932/1324] w-full md:hidden">
          <FooterBackground imageUrl={footer.backgroundImageUrl} />

          <div className="absolute inset-x-[2.8%] bottom-[2.8%] top-[2.4%]">
            <div className="absolute left-1/2 top-[4%] w-[clamp(40px,30vw,150px)] -translate-x-1/2 rounded-[14px] px-2 py-2 text-center">
              <p className="text-[clamp(1.06rem,4.8vw,1.5rem)] leading-none text-[#E61E7A] font-rascal">
                {footer.tagline}
              </p>
            </div>

            <div className="absolute inset-x-[10%] top-[35%] grid grid-cols-2">
              <div className="flex flex-col items-start gap-8">
                {footer.primaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className={footerLinkClassName}
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>

              <div className="flex flex-col items-end gap-8">
                {footer.secondaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className={footerLinkClassName}
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div className="absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={scrollToPageTop}
                className="relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365914]/40"
                aria-label="Scroll to top"
              >
                <div className="relative h-[32px] w-[156px]">
                  <Image
                    src={footer.logoImageUrl}
                    alt={footer.logoAlt}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              </button>
            </div>

            <div className="absolute inset-x-[7%] bottom-[8.5%] top-[82%]">
              <div className="grid h-full grid-cols-5 items-center gap-x-1.5">
                {footer.policyLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className={footerPolicyLinkClassName}
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden h-[clamp(440px,64vw,860px)] w-full md:block">
          <FooterBackground imageUrl={footer.backgroundImageUrl} />

          <div className="absolute inset-x-[2.5%] bottom-[3%] top-[22%] flex flex-col">
            <div className="absolute left-1/2 top-[-12%] w-[180px] -translate-x-1/2 rounded-[14px] bg-[#FCE7F3] px-2 py-3 text-center sm:w-[220px] md:w-[265px]">
              <p className="text-[clamp(1.16rem,1.65vw,2rem)] leading-none text-[#E61E7A] font-rascal">
                {footer.tagline}
              </p>
            </div>

            <div className="grid grid-cols-2 items-start px-[8.5%] pt-[18%] sm:px-[9.5%] sm:pt-[15%] md:px-[10.5%] md:pt-[13%]">
              <div className="flex flex-col items-start gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {footer.primaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className={footerDesktopLinkClassName}
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>

              <div className="flex flex-col items-end gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {footer.secondaryLinks.map((item) => (
                  <FooterLink
                    key={item.label}
                    href={item.href}
                    className={footerDesktopLinkClassName}
                  >
                    {item.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div className="relative mt-auto pb-[0.8%]">
              <div className="relative -translate-y-[10%] px-[6%] pb-[4.4%] pt-[2.6%] sm:-translate-y-[9%] md:-translate-y-[80%]">
                <button
                  type="button"
                  onClick={scrollToPageTop}
                  className="relative mx-auto block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365914]/40"
                  aria-label="Scroll to top"
                >
                  <div className="relative h-[52px] w-[180px] sm:h-[66px] sm:w-[230px] md:h-[84px] md:w-[300px] lg:h-[94px] lg:w-[340px]">
                    <Image
                      src={footer.logoImageUrl}
                      alt={footer.logoAlt}
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-[6.5%] bottom-[10.1%] top-[81.5%] sm:inset-x-[6%] md:inset-x-[5.5%]">
            <div className="grid h-full grid-cols-5 items-center gap-x-2 px-1 sm:gap-x-3 sm:px-2 md:px-4">
              {footer.policyLinks.map((item) => (
                <FooterLink
                  key={item.label}
                  href={item.href}
                  className={footerDesktopPolicyLinkClassName}
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
