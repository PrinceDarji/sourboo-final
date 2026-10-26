import { pageMetadata } from '@/src/lib/seo/metadata';
import LegalPageTemplate from '@/app/components/legal/LegalPageTemplate';

const termsSections = [
  {
    title: 'TERMS OF SERVICE',
    paragraphs: [
      'This website, www.sourboo.com, is operated by Sourboo Snacks LLP ("Sourboo", "we", "our", or "us"). By accessing or using this website, including placing an order, you agree to be bound by the terms and conditions set out below. If you do not agree with these Terms of Service, you should not use this website.',
    ],
  },
  {
    title: 'USE OF WEBSITE',
    paragraphs: [
      'By using this website, you confirm that you are at least 18 years of age or accessing the website under the supervision of a parent or legal guardian. You agree to use the website only for lawful purposes and not for any fraudulent, abusive, or illegal activity.',
      'We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion if we suspect misuse of the website or violation of these terms.',
    ],
  },
  {
    title: 'PRODUCT INFORMATION AND ACCURACY',
    paragraphs: [
      'We make every effort to ensure that product descriptions, pricing, ingredient information, and availability are accurate. However, errors may occur. Sourboo reserves the right to correct any errors, inaccuracies, or omissions at any time without prior notice.',
      'Product images are for representation purposes only. Actual packaging and product appearance may vary slightly.',
      'Customers are responsible for reviewing ingredient lists carefully before purchase. Individuals with known allergies should exercise caution and consult the ingredient information provided.',
    ],
  },
  {
    title: 'PRICING AND PAYMENTS',
    paragraphs: [
      'All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated.',
      'Payments are processed through secure third-party payment gateways. By placing an order, you agree to provide current, complete, and accurate payment information. Sourboo does not store credit or debit card details.',
      'We reserve the right to cancel any order in case of pricing errors, suspected fraud, payment failure, or stock unavailability. In such cases, refunds (if applicable) will be processed to the original method of payment.',
    ],
  },
  {
    title: 'ORDERS AND ACCEPTANCE',
    paragraphs: [
      'Placing an order on our website constitutes an offer to purchase. An order is considered accepted only after it has been confirmed and processed by us.',
      'We reserve the right to limit quantities, refuse orders, or discontinue products at any time without prior notice.',
    ],
  },
  {
    title: 'SHIPPING AND DELIVERY',
    paragraphs: [
      'Delivery timelines are estimates and may vary depending on location, courier delays, weather conditions, or unforeseen circumstances. Sourboo shall not be held liable for delays beyond our reasonable control.',
      'Risk and ownership of products pass to the customer upon delivery.',
    ],
  },
  {
    title: 'RETURNS AND REFUNDS',
    paragraphs: [
      'Due to the perishable and consumable nature of food products, items are non-returnable unless damaged, defective, or incorrect. Refunds or replacements are subject to verification as outlined in our Refund Policy.',
    ],
  },
  {
    title: 'INTELLECTUAL PROPERTY',
    paragraphs: [
      'All content on this website, including but not limited to text, images, branding, logos, graphics, and design elements, is the property of Sourboo Snacks LLP and is protected under applicable intellectual property laws. Unauthorized use, reproduction, or distribution is strictly prohibited.',
    ],
  },
  {
    title: 'LIMITATION OF LIABILITY',
    paragraphs: [
      'To the fullest extent permitted by law, Sourboo shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or website.',
      'Our liability, if any, shall not exceed the amount paid for the product in question.',
    ],
  },
  {
    title: 'INDEMNIFICATION',
    paragraphs: [
      'You agree to indemnify and hold harmless Sourboo Snacks LLP, its partners, employees, and affiliates from any claims, liabilities, damages, or expenses arising from your misuse of the website or violation of these Terms.',
    ],
  },
  {
    title: 'GOVERNING LAW AND JURISDICTION',
    paragraphs: [
      'These Terms of Service are governed by the laws of India. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts in Delhi.',
    ],
  },
  {
    title: 'CHANGES TO TERMS',
    paragraphs: [
      'We reserve the right to update or modify these Terms of Service at any time. Changes will be effective immediately upon posting on the website. Continued use of the website after such updates constitutes acceptance of the revised terms.',
    ],
  },
  {
    title: 'CONTACT INFORMATION',
    paragraphs: [
      'For any questions regarding these Terms of Service, you may contact:',
      'Sourboo Snacks LLP',
      '705, Tower 4&5, The Amaryllis - Phase 1, Central Delhi, Kishanganj, Delhi, 110007',
      'Email: cravings@sourboo.com',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return <LegalPageTemplate title="Terms and Conditions" sections={termsSections} />;
}

export const metadata = pageMetadata("Terms and Conditions", "Read the terms and conditions for shopping with Sourboo.", "/terms-and-conditions");
