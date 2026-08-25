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
  "ZOHO_SMTP_USER",
  "ZOHO_SMTP_APP_PASSWORD",
  "ORDER_EMAIL_FROM",
  "ORDER_EMAIL_REPLY_TO",
] as const;

const TRANSIENT_SMTP_CODES = new Set([
  "EAI_AGAIN",
  "ECONNECTION",
  "ECONNRESET",
  "ESOCKET",
  "ETIMEDOUT",
]);

type SmtpError = Error & {
  code?: string;
  command?: string;
  responseCode?: number;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to send order confirmation emails.`);
  }

  return value;
}

function parseIntegerEnv(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return value;
}

function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return fallback;
  }
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }

  throw new Error(`${name} must be either true or false.`);
}

function getZohoMailTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Domain-based Zoho Mail accounts use the Pro SMTP endpoint. Keep this
  // configurable because Zoho assigns the exact host by account/datacenter.
  const host = process.env.ZOHO_SMTP_HOST?.trim() || "smtppro.zoho.in";
  const port = parseIntegerEnv("ZOHO_SMTP_PORT", 465, 1, 65_535);
  const secure = parseBooleanEnv("ZOHO_SMTP_SECURE", port === 465);

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: getRequiredEnv("ZOHO_SMTP_USER"),
      pass: getRequiredEnv("ZOHO_SMTP_APP_PASSWORD"),
    },
    pool: true,
    maxConnections: parseIntegerEnv("ZOHO_SMTP_MAX_CONNECTIONS", 3, 1, 10),
    maxMessages: parseIntegerEnv("ZOHO_SMTP_MAX_MESSAGES", 50, 1, 1_000),
    connectionTimeout: parseIntegerEnv(
      "ZOHO_SMTP_CONNECTION_TIMEOUT_MS",
      15_000,
      1_000,
      120_000,
    ),
    greetingTimeout: parseIntegerEnv(
      "ZOHO_SMTP_GREETING_TIMEOUT_MS",
      10_000,
      1_000,
      120_000,
    ),
    socketTimeout: parseIntegerEnv(
      "ZOHO_SMTP_SOCKET_TIMEOUT_MS",
      30_000,
      1_000,
      300_000,
    ),
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
      servername: host,
    },
  });

  return cachedTransporter;
}

function isTransientSmtpError(error: unknown): boolean {
  const smtpError = error as SmtpError;
  return (
    TRANSIENT_SMTP_CODES.has(String(smtpError?.code || "").toUpperCase()) ||
    smtpError?.responseCode === 421 ||
    smtpError?.responseCode === 450 ||
    smtpError?.responseCode === 451 ||
    smtpError?.responseCode === 452
  );
}

function toSafeSmtpError(error: unknown): Error {
  const smtpError = error as SmtpError;
  const responseCode = smtpError?.responseCode;
  const code = smtpError?.code;

  if (responseCode === 535 || code === "EAUTH") {
    return new Error(
      "Zoho SMTP authentication failed. Check ZOHO_SMTP_USER, use a Zoho app-specific password when 2FA is enabled, and confirm the SMTP host for this Zoho datacenter.",
    );
  }

  const details = [
    responseCode ? `SMTP ${responseCode}` : "",
    code ? String(code) : "",
  ].filter(Boolean);
  return new Error(
    `Zoho SMTP delivery failed${details.length ? ` (${details.join(", ")})` : ""}.`,
  );
}

async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function getOrderConfirmationEmailConfiguration() {
  return REQUIRED_EMAIL_ENV_VARS.map((name) => ({
    name,
    configured: Boolean(process.env[name]?.trim()),
  }));
}

export async function verifyOrderConfirmationEmailTransport(): Promise<void> {
  try {
    await getZohoMailTransporter().verify();
  } catch (error) {
    throw toSafeSmtpError(error);
  }
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
  const transporter = getZohoMailTransporter();
  const from = getRequiredEnv("ORDER_EMAIL_FROM");
  const replyTo = getRequiredEnv("ORDER_EMAIL_REPLY_TO");
  const maxAttempts = parseIntegerEnv("ZOHO_SMTP_MAX_ATTEMPTS", 3, 1, 5);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await transporter.sendMail({
        from,
        to: input.order.customer_email,
        replyTo,
        subject: "AHHH!! Your Sourboo is on the way 💚",
        html: renderOrderConfirmationHtml(input),
        text: renderOrderConfirmationText(input),
        attachments: input.attachments,
      });
      return;
    } catch (error) {
      if (attempt === maxAttempts || !isTransientSmtpError(error)) {
        throw toSafeSmtpError(error);
      }

      // Short exponential backoff with jitter. Authentication and permanent
      // recipient errors are deliberately not retried.
      const delay = 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);
      await wait(delay);
    }
  }
}
