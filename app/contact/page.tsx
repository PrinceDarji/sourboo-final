import { pageMetadata } from '@/src/lib/seo/metadata';
import ReachUsPageTemplate from '@/app/components/legal/ReachUsPageTemplate';
import { getSocialLinksConfig } from '@/src/lib/sanity/siteSettings';

export const revalidate = 300;

export default async function ContactPage() {
  const social = await getSocialLinksConfig(revalidate);

  return (
    <ReachUsPageTemplate
      title="Contact"
      email="cravings@sourboo.com"
      phoneNumber="+91 8120202060"
      socialLinks={[
        { label: 'Instagram', href: social.instagramProfileUrl, platform: 'instagram' },
        { label: 'WhatsApp', href: social.whatsappUrl, platform: 'whatsapp' },
      ]}
    />
  );
}

export const metadata = pageMetadata("Contact Sourboo", "Contact Sourboo for order support, product questions and enquiries.", "/contact");
