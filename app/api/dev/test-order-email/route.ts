import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/src/lib/email/orderConfirmation";

export const runtime = "nodejs";

const REQUIRED_ENV_VARS = [
  "GOOGLE_WORKSPACE_SMTP_USER",
  "GOOGLE_WORKSPACE_SMTP_APP_PASSWORD",
  "ORDER_EMAIL_FROM",
  "ORDER_EMAIL_REPLY_TO",
] as const;

function getEnvStatus() {
  return REQUIRED_ENV_VARS.map((name) => ({
    name,
    configured: Boolean(process.env[name]?.trim()),
  }));
}

function getMissingEnvVars(): string[] {
  return getEnvStatus()
    .filter((item) => !item.configured)
    .map((item) => item.name);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const to = url.searchParams.get("to")?.trim();
  const shouldSend = url.searchParams.get("send") === "1";
  const missingEnvVars = getMissingEnvVars();

  if (!shouldSend) {
    return NextResponse.json({
      ok: true,
      mode: "check_only",
      usage:
        "Add ?send=1&to=sourboosnacks@gmail.com to send a test confirmation email.",
      env: getEnvStatus(),
    });
  }

  if (!to || !isValidEmail(to)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A valid to email is required. Use ?send=1&to=sourboosnacks@gmail.com",
        env: getEnvStatus(),
      },
      { status: 400 },
    );
  }

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing email environment variables.",
        missingEnvVars,
        env: getEnvStatus(),
      },
      { status: 500 },
    );
  }

  const merchantOrderId = `DEV-SB-${Date.now()}`;

  await sendOrderConfirmationEmail({
    order: {
      merchant_order_id: merchantOrderId,
      amount_paise: 74500,
      currency: "INR",
      customer_name: "Test Customer",
      customer_email: to,
      shipping_address: {
        line1: "705, Tower 4&5, The Amaryllis - Phase 1",
        line2: "Kishanganj",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110007",
      },
    },
    items: [
      {
        name: "Side Eye Tamarin Jar",
        quantity: 2,
        lineTotalPaise: 69000,
      },
      {
        name: "Shipping",
        quantity: 1,
        lineTotalPaise: 5500,
      },
    ],
  });

  return NextResponse.json({
    ok: true,
    message: "Test order confirmation email sent.",
    to,
    merchantOrderId,
  });
}
