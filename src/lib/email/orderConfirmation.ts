import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type {
  CheckoutShippingAddress,
  OrderRecord,
} from "@/src/lib/payments/orders";

export type OrderConfirmationItem = {
  name: string;
  quantity: number;
  lineTotalPaise: number;
};

export type OrderConfirmationAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type OrderConfirmationInput = {
  order: Pick<
    OrderRecord,
    | "merchant_order_id"
    | "amount_paise"
    | "currency"
    | "customer_name"
    | "customer_email"
  > & {
    shipping_address?: CheckoutShippingAddress | null;
  };
  items: OrderConfirmationItem[];
  attachments?: OrderConfirmationAttachment[];
};

let cachedTransporter: Transporter | null = null;

const REQUIRED_EMAIL_ENV_VARS = [
  "GOOGLE_WORKSPACE_SMTP_USER",
  "GOOGLE_WORKSPACE_SMTP_APP_PASSWORD",
  "ORDER_EMAIL_FROM",
  "ORDER_EMAIL_REPLY_TO",
] as const;

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
    host: process.env.GOOGLE_WORKSPACE_SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number.parseInt(process.env.GOOGLE_WORKSPACE_SMTP_PORT || "465", 10),
    secure: (process.env.GOOGLE_WORKSPACE_SMTP_SECURE || "true") !== "false",
    auth: {
      user: getRequiredEnv("GOOGLE_WORKSPACE_SMTP_USER"),
      pass: getRequiredEnv("GOOGLE_WORKSPACE_SMTP_APP_PASSWORD"),
    },
  });

  return cachedTransporter;
}

export function getOrderConfirmationEmailConfiguration() {
  return REQUIRED_EMAIL_ENV_VARS.map((name) => ({
    name,
    configured: Boolean(process.env[name]?.trim()),
  }));
}

export async function verifyOrderConfirmationEmailTransport(): Promise<void> {
  await getGoogleWorkspaceTransporter().verify();
}

function formatMoney(amountPaise: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderItems(items: OrderConfirmationItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e61b71;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e61b71;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e61b71;text-align:right;">${formatMoney(
            item.lineTotalPaise,
            "INR",
          )}</td>
        </tr>
      `,
    )
    .join("");
}

function renderAddress(address?: CheckoutShippingAddress | null): string {
  if (!address) {
    return "";
  }

  const lines = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ].filter((line): line is string => Boolean(line));

  return lines.map((line) => escapeHtml(line)).join("<br />");
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function renderTextItems(items: OrderConfirmationItem[]): string {
  return items
    .map(
      (item) =>
        `${item.name} | ${item.quantity} | ${formatMoney(item.lineTotalPaise, "INR")}`,
    )
    .join("\n");
}

function renderTextAddress(address?: CheckoutShippingAddress | null): string {
  if (!address) {
    return "";
  }

  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function renderOrderConfirmationHtml(input: OrderConfirmationInput): string {
  const { order, items } = input;
  const brandColor = "#e61b71";
  const accentColor = "#cdd502";
  const borderColor = "#e61b71";
  const firstName = getFirstName(order.customer_name);
  const total = formatMoney(order.amount_paise, order.currency || "INR");
  const address = renderAddress(order.shipping_address);

  return `
    <div style="margin:0;padding:0;background:#cdd502;font-family:Arial,Helvetica,sans-serif;color:${brandColor};">
      <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
        <div style="background:#ffffff;border:1px solid ${borderColor};border-radius:8px;padding:28px;">
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:${brandColor};">WE'RE SCREAMING. 💚</h1>
          <p style="margin:0 0 14px;font-size:16px;line-height:1.5;">Hey ${escapeHtml(
            firstName,
          )},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">Thank you so much for ordering Sourboo. Seriously. 💋</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.5;">We can't wait for you to try it. Your jar(s) are being packed right now and we'll send you another email as soon as they're on the way.</p>

          <p style="margin:0 0 12px;font-size:16px;line-height:1.5;"><strong>💚 First things first.</strong><br />Pop your jar in the fridge before cracking it open. Sourboo is at its best when it's ice cold.</p>

          <div style="margin:0 0 22px;padding:16px;border:1px solid ${borderColor};border-radius:8px;background:${accentColor};">
            <p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:${brandColor};"><strong>🌶️ THE SOUR FILES // 001</strong></p>
            <p style="margin:0 0 10px;font-size:15px;line-height:1.5;"><strong>Mission:</strong> Your first Sourboo bite.</p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">You'll need:</p>
            <ul style="margin:0 0 0 20px;padding:0;font-size:15px;line-height:1.6;">
              <li>A salted cracker</li>
              <li>Cream cheese</li>
              <li>One Sourboo gherkin</li>
            </ul>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.5;">One bite. Welcome to the club.</p>
          </div>

          <p style="margin:0 0 22px;font-size:15px;line-height:1.5;">
            <strong>Order ID:</strong> ${escapeHtml(order.merchant_order_id)}<br />
            <strong>Total:</strong> ${total}
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;font-size:14px;">
            <thead>
              <tr>
                <th align="left" style="padding:0 0 8px;border-bottom:2px solid ${brandColor};">Item</th>
                <th align="center" style="padding:0 0 8px;border-bottom:2px solid ${brandColor};">Qty</th>
                <th align="right" style="padding:0 0 8px;border-bottom:2px solid ${brandColor};">Amount</th>
              </tr>
            </thead>
            <tbody>${renderItems(items)}</tbody>
          </table>

          ${
            address
              ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.5;"><strong>Shipping to:</strong><br />${address}</p>`
              : ""
          }

          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;"><strong>Bonus:</strong> Don't throw away the brine. Add a splash to a glass of Diet Coke over ice and report back.</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Got a better pairing?<br />Tag us with <strong>#SourbooApproved</strong> or DM us your weirdest combinations. If we love it, it'll become a future Sour File. For help, reply to this email.</p>
          <p style="margin:0;font-size:15px;line-height:1.5;">See you on the sour side.<br /><strong>Team Sourboo</strong></p>
        </div>
      </div>
    </div>
  `;
}

function renderOrderConfirmationText(input: OrderConfirmationInput): string {
  const { order, items } = input;
  const firstName = getFirstName(order.customer_name);
  const total = formatMoney(order.amount_paise, order.currency || "INR");
  const address = renderTextAddress(order.shipping_address);

  return `Hey ${firstName},

WE'RE SCREAMING. 💚

Thank you so much for ordering Sourboo. Seriously. 💋

We can't wait for you to try it. Your jar(s) are being packed right now and we'll send you another email as soon as they're on the way.

💚 First things first.
Pop your jar in the fridge before cracking it open. Sourboo is at its best when it's ice cold.

🌶️ THE SOUR FILES // 001
Mission: Your first Sourboo bite.

You'll need:
🥒 A salted cracker
🥒 Cream cheese
🥒 One Sourboo gherkin

One bite. Welcome to the club.

Order ID: ${order.merchant_order_id}
Total: ${total}

Item | Qty | Amount
${renderTextItems(items)}

${address ? `Shipping to:\n${address}\n\n` : ""}Bonus: Don't throw away the brine. Add a splash to a glass of Diet Coke over ice and report back.

Got a better pairing?
Tag us with #SourbooApproved or DM us your weirdest combinations. If we love it, it'll become a future Sour File. For help, reply to this email.

See you on the sour side.
Team Sourboo`;
}

export async function sendOrderConfirmationEmail(
  input: OrderConfirmationInput,
): Promise<void> {
  const transporter = getGoogleWorkspaceTransporter();
  const from =
    process.env.ORDER_EMAIL_FROM?.trim() || "Sourboo <cravings@sourboo.com>";
  const replyTo =
    process.env.ORDER_EMAIL_REPLY_TO?.trim() || "cravings@sourboo.com";

  await transporter.sendMail({
    from,
    to: input.order.customer_email,
    replyTo,
    subject: "AHHH!! Your Sourboo is on the way 💚",
    html: renderOrderConfirmationHtml(input),
    text: renderOrderConfirmationText(input),
    attachments: input.attachments,
  });
}
