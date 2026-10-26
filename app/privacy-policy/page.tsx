import { pageMetadata } from '@/src/lib/seo/metadata';
import LegalPageTemplate from '@/app/components/legal/LegalPageTemplate';

const privacySections = [
  {
    title: 'OVERVIEW',
    paragraphs: [
      'Sourboo Snacks LLP ("Sourboo", "we", "our", or "us") operates the website www.sourboo.com. We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase from us.',
    ],
  },
  {
    title: 'INFORMATION WE COLLECT',
    paragraphs: [
      'When you browse our website or place an order, we may collect certain personal details including your name, email address, phone number, billing and shipping address, and order history. If you make a purchase, your payment is processed securely through third-party payment gateways. We do not store your debit or credit card information on our servers.',
      'We may also automatically collect certain technical information such as your IP address, browser type, device details, pages visited, and interaction data. This information helps us improve website performance and user experience.',
    ],
  },
  {
    title: 'HOW WE USE YOUR INFORMATION',
    paragraphs: [
      'Your information is used primarily to process and deliver orders, provide customer support, send transactional communications such as order confirmations and shipping updates, and improve our services. If you opt in, we may also send you updates, promotional content, or product announcements. You may unsubscribe from marketing communications at any time.',
    ],
  },
  {
    title: 'SHARING OF INFORMATION',
    paragraphs: [
      'We may share your information with trusted third parties strictly for operational purposes. These may include payment processors, logistics and delivery partners, website hosting providers, and regulatory authorities where legally required. We do not sell, rent, or trade your personal information to third parties.',
    ],
  },
  {
    title: 'DATA SECURITY',
    paragraphs: [
      'We implement reasonable technical and organizational safeguards to protect your personal data. While we take security seriously, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute protection.',
    ],
  },
  {
    title: 'COOKIES',
    paragraphs: [
      'Our website may use cookies and similar technologies to enhance your browsing experience, analyze traffic, and remember user preferences. You may choose to disable cookies through your browser settings, though this may impact certain functionalities of the website.',
    ],
  },
  {
    title: 'DATA RETENTION',
    paragraphs: [
      'We retain your personal information only for as long as necessary to fulfill orders, comply with legal obligations, resolve disputes, and enforce our policies.',
    ],
  },
  {
    title: 'YOUR RIGHTS',
    paragraphs: [
      'You may request access to, correction of, or deletion of your personal information by contacting us at the email address provided below, subject to applicable legal requirements.',
    ],
  },
  {
    title: "CHILDREN'S PRIVACY",
    paragraphs: [
      'Our website is intended for users above the age of 18. We do not knowingly collect personal information from minors.',
    ],
  },
  {
    title: 'POLICY UPDATES',
    paragraphs: [
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page along with the updated effective date.',
    ],
  },
  {
    title: 'CONTACT',
    paragraphs: [
      'If you have any questions regarding this Privacy Policy or how your information is handled, you may contact:',
      'Sourboo Snacks LLP',
      '705, Tower 4&5, The Amaryllis - Phase 1, Central Delhi, Kishanganj, Delhi, 110007',
      'Email: cravings@sourboo.com',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return <LegalPageTemplate title="Privacy Policy" sections={privacySections} />;
}

export const metadata = pageMetadata("Privacy Policy", "Learn how Sourboo collects, uses and protects your information.", "/privacy-policy");
