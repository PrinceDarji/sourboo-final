import Navbar from '@/app/components/about/AboutNavbar';
import SiteFooter from '@/app/components/SiteFooter';

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalPageTemplateProps = {
  title: string;
  sections: LegalSection[];
};

export default function LegalPageTemplate({ title, sections }: LegalPageTemplateProps) {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E61E6E] text-[#FFFF88]">
      <Navbar />

      <section className="mx-auto w-full max-w-[1800px] px-6 pb-20 pt-32 sm:px-10 sm:pt-36 md:px-14 md:pb-28 md:pt-44 lg:px-16">
        <h1 className="text-[clamp(2.5rem,5.6vw,6.1rem)] leading-[0.94] font-coolvetica">{title}</h1>

        <div className="mt-8 space-y-12 md:mt-12 md:space-y-16">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-[clamp(1.45rem,2.8vw,2.35rem)] leading-none font-coolvetica">
                {section.title}
              </h2>
              <div className="mt-3 space-y-6 md:mt-4 md:space-y-8">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={`${section.title}-${index}`}
                    className="max-w-[1650px] text-[clamp(1.45rem,2.3vw,3rem)] leading-[1.2] font-coolvetica"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
