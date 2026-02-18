import Image from 'next/image';
import Link from 'next/link';

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

export default function SiteFooter() {
  return (
    <footer className="w-full overflow-x-hidden">
      <div className="w-full">
        <div className="relative h-[clamp(440px,64vw,860px)] w-full">
          <Image
            src="/footer/footerbase.svg"
            alt=""
            fill
            aria-hidden
            className="object-fill"
          />

          <div className="absolute inset-x-[2.5%] bottom-[3%] top-[22%] flex flex-col">
            <div className="absolute left-1/2 top-[-12%] w-[180px] -translate-x-1/2 rounded-[14px] bg-[#FCE7F3] px-2 py-3 text-center sm:w-[220px] md:w-[265px]">
              <p className="text-[clamp(0.95rem,1.2vw,1.35rem)] leading-[1.05] text-[#232222] font-schoolbell">
                DO YOU EVEN REMEMBER HOW IT STARTED
              </p>
              <p className="mt-3 text-[clamp(1.05rem,1.5vw,1.8rem)] leading-none text-[#E61E7A] font-rascal">
                stay sour
              </p>
            </div>

            <div className="grid grid-cols-2 items-start px-[8.5%] pt-[18%] sm:px-[9.5%] sm:pt-[15%] md:px-[10.5%] md:pt-[13%]">
              <div className="flex flex-col items-start gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {primaryLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(1.1rem,2vw,2.2rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col items-end gap-[clamp(0.8rem,1.8vw,2.2rem)]">
                {secondaryLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[clamp(1.1rem,2vw,2.2rem)] leading-none text-[#365914] font-coolvetica transition hover:opacity-80"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mt-auto pb-[0.8%]">
              <div className="relative px-[6%] pb-[4.4%] pt-[2.6%]">
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

              <div className="mx-[6.5%] overflow-hidden border-t-2 border-[#A8CF3D] bg-white/95 sm:mx-[6%] md:mx-[5.5%]">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-5 sm:px-6 md:px-10 md:py-4">
                  {policyLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-center text-[clamp(0.72rem,1.1vw,1.15rem)] leading-none text-[#1F1F1F] font-coolvetica transition hover:opacity-75"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
