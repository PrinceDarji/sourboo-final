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
      'If you receive a damaged product, please email us within 48 hours of delivery at sourboosnacks@gmail.com with the following details:',
      '- Your order number',
      '- Clear photographs of the damaged jar and outer packaging',
      '- A brief description of the issue',
    ],
  },
  {
    title: 'REVIEW AND RESOLUTION',
    paragraphs: [
      'After reviewing the request, we will determine whether a replacement or refund is appropriate. Approved refunds will be processed to the original method of payment.',
    ],
  },
  {
    title: 'CONTACT',
    paragraphs: [
      'If you have any general questions regarding your order, please contact us at sourboosnacks@gmail.com',
    ],
  },
];

export default function RefundPolicyPage() {
  return <LegalPageTemplate title="Refund Policy" sections={refundSections} />;
}
