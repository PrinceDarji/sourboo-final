import Link from 'next/link';
import Navbar from '@/app/components/about/AboutNavbar';
import SiteFooter from '@/app/components/SiteFooter';

type SocialPlatform = 'instagram' | 'whatsapp';

type SocialLink = {
  label: string;
  href: string;
  platform: SocialPlatform;
};

type ReachUsPageTemplateProps = {
  title: string;
  email: string;
  phoneNumber: string;
  socialLinks: SocialLink[];
  intro?: string;
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-8 md:w-8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-8 md:w-8" aria-hidden>
      <path
        d="M20.5 12.2A8.5 8.5 0 1 1 8.1 4.7a8.5 8.5 0 0 1 12.4 7.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m4.8 20.4 1.1-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9.6 8.8c.2-.4.5-.4.7-.4h.5c.2 0 .5 0 .6.4l.5 1.3c.1.2.1.5 0 .7l-.3.5c-.2.2-.2.4-.1.6.3.5 1 1.4 2.1 1.9.3.1.5.1.7-.1l.5-.5c.2-.2.4-.2.7-.1l1.2.5c.4.1.4.4.4.6v.5c0 .2 0 .6-.4.8-.4.3-1 .5-1.7.4-1.2-.2-2.8-.9-4.2-2.3-1.3-1.3-2-2.8-2.1-3.9-.1-.8.1-1.4.4-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'instagram') return <InstagramIcon />;
  return <WhatsAppIcon />;
}

export default function ReachUsPageTemplate({
  title,
  email,
  phoneNumber,
  socialLinks,
  intro,
}: ReachUsPageTemplateProps) {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FFFF88] text-[#E61E6E]">
      <Navbar />

      <section className="mx-auto w-full max-w-[1800px] px-6 pb-20 pt-32 sm:px-10 sm:pt-36 md:px-14 md:pb-28 md:pt-44 lg:px-16">
        <h1 className="text-[clamp(2.5rem,5.6vw,6.1rem)] leading-[0.94] font-coolvetica">{title}</h1>

        {intro ? (
          <p className="mt-6 max-w-[1300px] text-[clamp(1.45rem,2.3vw,3rem)] leading-[1.2] font-coolvetica">
            {intro}
          </p>
        ) : null}

        <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
          <article>
            <h2 className="text-[clamp(1.45rem,2.8vw,2.35rem)] leading-none font-coolvetica">COMPANY NAME</h2>
            <p className="mt-3 text-[clamp(1.45rem,2.3vw,3rem)] leading-[1.2] font-coolvetica">
              Sourboo Snacks LLP
            </p>
          </article>

          <article>
            <h2 className="text-[clamp(1.45rem,2.8vw,2.35rem)] leading-none font-coolvetica">MAIL</h2>
            <Link
              href={`mailto:${email}`}
              className="mt-3 inline-block text-[clamp(1.45rem,2.3vw,3rem)] leading-[1.2] font-coolvetica underline decoration-transparent transition hover:decoration-current"
            >
              {email}
            </Link>
          </article>

          <article>
            <h2 className="text-[clamp(1.45rem,2.8vw,2.35rem)] leading-none font-coolvetica">PHONE NUMBER</h2>
            <Link
              href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
              className="mt-3 inline-block text-[clamp(1.45rem,2.3vw,3rem)] leading-[1.2] font-coolvetica underline decoration-transparent transition hover:decoration-current"
            >
              {phoneNumber}
            </Link>
          </article>

          <article>
            <h2 className="text-[clamp(1.45rem,2.8vw,2.35rem)] leading-none font-coolvetica">SOCIAL</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 md:gap-5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#F08A97] px-4 py-2 text-[clamp(1.2rem,1.9vw,2rem)] leading-none font-coolvetica transition hover:bg-[#F08A97]/10"
                >
                  <SocialIcon platform={social.platform} />
                  <span>{social.label}</span>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
