import { pageMetadata } from '@/src/lib/seo/metadata';
import ReachUsPageTemplate from '@/app/components/legal/ReachUsPageTemplate';
import { getSocialLinksConfig } from '@/src/lib/sanity/siteSettings';

export const revalidate = 300;

export default async function JoinPage() {
  const social = await getSocialLinksConfig(revalidate);

  return (
    <ReachUsPageTemplate
      title="Join Us"
      intro="For collabs, stockists, events, and all things Sourboo."
      email="cravings@sourboo.com"
      phoneNumber="+91 8120202060"
      socialLinks={[
        { label: 'Instagram', href: social.instagramProfileUrl, platform: 'instagram' },
        { label: 'WhatsApp', href: social.whatsappUrl, platform: 'whatsapp' },
      ]}
    />
  );
}

export const metadata = pageMetadata("Join Sourboo", "Get in touch with Sourboo for collaborations and community enquiries.", "/join");
