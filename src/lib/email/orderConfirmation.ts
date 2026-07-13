import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { CheckoutShippingAddress, OrderRecord } from '@/src/lib/payments/orders';

export type OrderConfirmationItem = {
  name: string;
  quantity: number;
  lineTotalPaise: number;
};

type OrderConfirmationInput = {
  order: Pick<
    OrderRecord,
    'merchant_order_id' | 'amount_paise' | 'currency' | 'customer_name' | 'customer_email'
  > & {
    shipping_address?: CheckoutShippingAddress | null;
  };
  items: OrderConfirmationItem[];
};

let cachedTransporter: Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to send order confirmation emails.`);
  }

  return value;
}

function getGoogleWorkspaceTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.GOOGLE_WORKSPACE_SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number.parseInt(process.env.GOOGLE_WORKSPACE_SMTP_PORT || '465', 10),
    secure: (process.env.GOOGLE_WORKSPACE_SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: getRequiredEnv('GOOGLE_WORKSPACE_SMTP_USER'),
      pass: getRequiredEnv('GOOGLE_WORKSPACE_SMTP_APP_PASSWORD'),
    },
  });

  return cachedTransporter;
}

function formatMoney(amountPaise: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderItems(items: OrderConfirmationItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #ead9c8;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #ead9c8;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #ead9c8;text-align:right;">${formatMoney(
            item.lineTotalPaise,
            'INR',
          )}</td>
        </tr>
      `,
    )
    .join('');
}

function renderAddress(address?: CheckoutShippingAddress | null): string {
  if (!address) {
    return '';
  }

  const lines = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ].filter((line): line is string => Boolean(line));

  return lines.map((line) => escapeHtml(line)).join('<br />');
}

function renderOrderConfirmationHtml(input: OrderConfirmationInput): string {
  const { order, items } = input;
  const brandColor = '#d93d2f';
  const total = formatMoney(order.amount_paise, order.currency || 'INR');
  const address = renderAddress(order.shipping_address);

  return `
    <div style="margin:0;padding:0;background:#fff8ef;font-family:Arial,Helvetica,sans-serif;color:#2e2a2a;">
      <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
        <div style="background:#ffffff;border:1px solid #ead9c8;border-radius:8px;padding:28px;">
          <h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:${brandColor};">Your Sourboo order is confirmed</h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">Hi ${escapeHtml(
            order.customer_name,
          )}, we have received your payment and your order is now confirmed.</p>

          <p style="margin:0 0 22px;font-size:15px;line-height:1.5;">
            <strong>Order ID:</strong> ${escapeHtml(order.merchant_order_id)}<br />
            <strong>Total:</strong> ${total}
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;font-size:14px;">
            <thead>
              <tr>
                <th align="left" style="padding:0 0 8px;border-bottom:2px solid #2e2a2a;">Item</th>
                <th align="center" style="padding:0 0 8px;border-bottom:2px solid #2e2a2a;">Qty</th>
                <th align="right" style="padding:0 0 8px;border-bottom:2px solid #2e2a2a;">Amount</th>
              </tr>
            </thead>
            <tbody>${renderItems(items)}</tbody>
          </table>

          ${
            address
              ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.5;"><strong>Shipping to:</strong><br />${address}</p>`
              : ''
          }

          <p style="margin:0;font-size:14px;line-height:1.5;color:#5f5651;">
            We will email you again once your order is dispatched. For help, reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(input: OrderConfirmationInput): Promise<void> {
  const transporter = getGoogleWorkspaceTransporter();
  const from = process.env.ORDER_EMAIL_FROM?.trim() || 'Sourboo <cravings@sourboo.com>';
  const replyTo = process.env.ORDER_EMAIL_REPLY_TO?.trim() || 'cravings@sourboo.com';

  await transporter.sendMail({
    from,
    to: input.order.customer_email,
    replyTo,
    subject: `Sourboo order confirmed: ${input.order.merchant_order_id}`,
    html: renderOrderConfirmationHtml(input),
    text: `Your Sourboo order is confirmed.

Order ID: ${input.order.merchant_order_id}
Total: ${formatMoney(input.order.amount_paise, input.order.currency || 'INR')}

We will email you again once your order is dispatched.`,
  });
}
