import { pageMetadata } from '@/src/lib/seo/metadata';
import LegalPageTemplate from '@/app/components/legal/LegalPageTemplate';

const refundSections = [
  {
    title: 'OVERVIEW',
    paragraphs: [
      'Due to the perishable nature of our products, we do not offer returns or refunds once an order has been delivered.',
      'Refunds or replacements will only be considered in cases where a jar has arrived broken or visibly damaged during transit.',
    ],
  },
  {
    title: 'DAMAGED PRODUCT CLAIMS',
    paragraphs: [
      'If you receive a damaged product, please email us within 48 hours of delivery at cravings@sourboo.com with the following details:',
      '- Your order number',
      '- Clear photographs of the damaged jar and outer packaging',
      '- A brief description of the issue',
    ],
  },
  {
    title: 'EXCHANGE / REPLACEMENT POLICY',
    paragraphs: [
      'If your claim is for an exchange or replacement, please note the following:',
      '- Request Window: Requests must be made within 48 hours of delivery.',
      '- Dispatch Time: Once approved, the replacement product will be dispatched within 2-3 business days after the original item is received and inspected.',
      '- Delivery Timeline: Typically, replacements reach you within 3-7 business days of dispatch. Total turnaround time is generally 7-10 business days, depending on your location.',
    ],
  },
  {
    title: 'REFUND PROCESS',
    paragraphs: [
      'If a refund is determined to be the appropriate resolution:',
      '- Approval: Once your request is approved, we will process the refund within 3-5 business days.',
      '- Credit Timeline: After processing, the refund will be credited to your original mode of payment within 7-10 business days, depending on your bank or payment provider.',
    ],
  },
  {
    title: 'CONTACT',
    paragraphs: [
      'For any general questions regarding your order or these policies, please reach out to us at:',
      'Email: cravings@sourboo.com',
    ],
  },
];

export default function RefundPolicyPage() {
  return <LegalPageTemplate title="Refund & Exchange Policy" sections={refundSections} />;
}

export const metadata = pageMetadata("Refund Policy", "Read Sourboo\u2019s policy for damaged deliveries, refunds and replacements.", "/refund-policy");
