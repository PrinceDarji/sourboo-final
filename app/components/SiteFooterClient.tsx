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

const footerLinkClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-lg leading-snug text-[#F5FFBC] font-coolvetica hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-2xl';

function FooterBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#201709]"
      style={{
        maskImage: "url('/footer-full-bleed-mask.svg')",
        WebkitMaskImage: "url('/footer-full-bleed-mask.svg')",
        maskSize: '103% 100%',
        WebkitMaskSize: '103% 100%',
        maskPosition: 'center top',
        WebkitMaskPosition: 'center top',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
      aria-hidden>
      <Image src="/footer-photo.webp" alt="" fill sizes="100vw" quality={80} className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/70" />
    </div>
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

      <div className="relative isolate w-full px-5 py-16 md:px-10 md:py-24">
        <FooterBackground />
        <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-7 md:gap-10">
          <p className="w-[24%] min-w-[76px] max-w-[320px] py-3 text-center text-[clamp(1.35rem,5vw,1.875rem)] leading-tight text-[#FFFFA0] [text-shadow:0_2px_4px_#000,0_0_12px_#000] font-rascal">
            {footer.tagline}
          </p>
          <button type="button" onClick={scrollToPageTop} aria-label="Scroll to top" className="relative h-16 w-[min(75vw,300px)] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5FFBC] md:h-24">
            <Image src={footer.logoImageUrl} alt={footer.logoAlt} fill sizes="(max-width: 400px) 75vw, 300px" className="object-contain" />
          </button>
          <nav aria-label="Footer navigation" className="grid w-full max-w-[720px] grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            {[...footer.primaryLinks, ...footer.secondaryLinks].map((item) => (
              <FooterLink key={`${item.href}-${item.label}`} href={item.href} className={footerLinkClassName}>{item.label}</FooterLink>
            ))}
          </nav>
          <nav aria-label="Store policies" className="flex w-full flex-wrap justify-center gap-x-4 gap-y-1 border-t border-white/30 pt-5">
            {footer.policyLinks.map((item) => (
              <FooterLink key={`${item.href}-${item.label}`} href={item.href} className="inline-flex min-h-11 items-center rounded px-2 text-center text-sm leading-snug text-white font-coolvetica hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base">{item.label}</FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
