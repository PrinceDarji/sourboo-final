import ReachUsPageTemplate from '@/app/components/legal/ReachUsPageTemplate';

export default function ContactPage() {
  return (
    <ReachUsPageTemplate
      title="Contact"
      email="sourboosnacks@gmail.com"
      phoneNumber="+91 8120202060"
      socialLinks={[
        { label: 'Instagram', href: 'https://www.instagram.com/eatsourboo?igsh=MTI2OHRmcnM4cjF2OQ==', platform: 'instagram' },
        { label: 'WhatsApp', href: 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN', platform: 'whatsapp' },
      ]}
    />
  );
}
