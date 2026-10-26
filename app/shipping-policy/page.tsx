import { pageMetadata } from '@/src/lib/seo/metadata';
import LegalPageTemplate from '@/app/components/legal/LegalPageTemplate';

const shippingSections = [
  {
    title: 'OVERVIEW',
    paragraphs: [
      'Thank you for shopping with Sourboo Snacks LLP. This Shipping Policy explains how and when your orders are processed and delivered.',
      'All orders are processed within 2–4 business days after payment confirmation. Orders are not processed or dispatched on Sundays or public holidays. During high-demand periods or product drops, processing times may be slightly extended.',
      'Once your order has been dispatched, you will receive a confirmation message with tracking details via email or SMS.',
    ],
  },
  {
    title: 'DELIVERY TIMELINES',
    paragraphs: [
      'We currently ship across India. Estimated delivery timelines are as follows:',
      'Metro cities: 3–5 business days after dispatch',
      'Non-metro locations: 5–8 business days after dispatch',
      'Please note that delivery timelines are estimates and may vary due to courier delays, weather conditions, public holidays, or unforeseen logistical issues. Sourboo Snacks LLP is not liable for delays once the order has been handed over to the courier partner.',
    ],
  },
  {
    title: 'SHIPPING CHARGES',
    paragraphs: [
      'Shipping charges, if applicable, will be calculated and displayed at checkout before payment.',
    ],
  },
  {
    title: 'ADDRESS ACCURACY',
    paragraphs: [
      'Customers are responsible for providing accurate and complete shipping information. Sourboo shall not be responsible for delays or non-delivery resulting from incorrect address details.',
      'If an order is returned to us due to failed delivery attempts or incorrect address information, re-shipping charges may apply.',
    ],
  },
  {
    title: 'DAMAGED PACKAGE',
    paragraphs: [
      'If you receive a damaged package, please refer to our Refund Policy and contact us within 48 hours of delivery with supporting photographs.',
    ],
  },
  {
    title: 'CONTACT',
    paragraphs: [
      'For any shipping-related queries, please contact us at:',
      'cravings@sourboo.com',
    ],
  },
];

export default function ShippingPolicyPage() {
  return <LegalPageTemplate title="Shipping Policy" sections={shippingSections} />;
}

export const metadata = pageMetadata("Shipping Policy", "Read Sourboo\u2019s order processing, shipping and delivery policy.", "/shipping-policy");
