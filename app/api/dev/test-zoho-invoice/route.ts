import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/src/lib/email/orderConfirmation";
import { createPaidZohoInvoice, listZohoTaxes } from "@/src/lib/invoices/zoho";
import type { OrderRecord, StoredOrderItem } from "@/src/lib/payments/orders";

export const runtime = "nodejs";

const REQUIRED_ENV_VARS = [
  "ZOHO_CLIENT_ID",
  "ZOHO_CLIENT_SECRET",
  "ZOHO_REFRESH_TOKEN",
  "ZOHO_ORGANIZATION_ID",
] as const;

const REQUIRED_EMAIL_ENV_VARS = [
  "GOOGLE_WORKSPACE_SMTP_USER",
  "GOOGLE_WORKSPACE_SMTP_APP_PASSWORD",
  "ORDER_EMAIL_FROM",
  "ORDER_EMAIL_REPLY_TO",
] as const;

const OPTIONAL_ENV_VARS = [
  "ZOHO_ACCOUNTS_URL",
  "ZOHO_API_DOMAIN",
  "ZOHO_PAYMENT_ACCOUNT_ID",
  "ZOHO_ITEM_ID_BY_SLUG",
  "ZOHO_DEFAULT_TAX_ID",
  "ZOHO_INTER_STATE_TAX_ID",
  "ZOHO_IGST_TAX_ID",
  "ZOHO_ORIGIN_STATE_CODE",
  "ZOHO_SHIPPING_TAX_ID",
  "ZOHO_TAX_EXEMPTION_ID",
] as const;

function getEnvStatus(names: readonly string[]) {
  return names.map((name) => ({
    name,
    configured: Boolean(process.env[name]?.trim()),
  }));
}

function getMissingEnvVars(names: readonly string[]): string[] {
  return getEnvStatus(names)
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
  const shouldCreate = url.searchParams.get("create") === "1";
  const shouldListTaxes = url.searchParams.get("taxes") === "1";
  const shouldSendEmail = url.searchParams.get("send") === "1";
  const email =
    url.searchParams.get("email")?.trim() || "sourboosnacks@gmail.com";
  const missingZohoEnvVars = getMissingEnvVars(REQUIRED_ENV_VARS);
  const missingEmailEnvVars = shouldSendEmail
    ? getMissingEnvVars(REQUIRED_EMAIL_ENV_VARS)
    : [];

  if (shouldListTaxes) {
    if (missingZohoEnvVars.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing Zoho environment variables.",
          missingZohoEnvVars,
          requiredEnv: getEnvStatus(REQUIRED_ENV_VARS),
          optionalEnv: getEnvStatus(OPTIONAL_ENV_VARS),
        },
        { status: 500 },
      );
    }

    const taxes = await listZohoTaxes();

    return NextResponse.json({
      ok: true,
      taxes: taxes.map((tax) => ({
        taxId: tax.tax_id ? String(tax.tax_id) : null,
        name: tax.tax_name || null,
        percentage: tax.tax_percentage ?? null,
        type: tax.tax_type || null,
        specificType: tax.tax_specific_type || null,
      })),
    });
  }

  if (!shouldCreate) {
    return NextResponse.json({
      ok: true,
      mode: "check_only",
      usage:
        "Add ?taxes=1 to list Zoho tax IDs. Add ?create=1&email=sourboosnacks@gmail.com to create a real Zoho test invoice/payment. Add &send=1 to also email the PDF attachment.",
      requiredEnv: getEnvStatus(REQUIRED_ENV_VARS),
      requiredEmailEnv: getEnvStatus(REQUIRED_EMAIL_ENV_VARS),
      optionalEnv: getEnvStatus(OPTIONAL_ENV_VARS),
    });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "A valid email is required.",
      },
      { status: 400 },
    );
  }

  if (missingZohoEnvVars.length > 0 || missingEmailEnvVars.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing environment variables.",
        missingZohoEnvVars,
        missingEmailEnvVars,
        requiredEnv: getEnvStatus(REQUIRED_ENV_VARS),
        requiredEmailEnv: getEnvStatus(REQUIRED_EMAIL_ENV_VARS),
        optionalEnv: getEnvStatus(OPTIONAL_ENV_VARS),
      },
      { status: 500 },
    );
  }

  const nowIso = new Date().toISOString();
  const merchantOrderId = `DEV-ZOHO-SB-${Date.now()}`;
  const order: OrderRecord = {
    id: `dev-${Date.now()}`,
    merchant_order_id: merchantOrderId,
    phonepe_order_id: `DEV-PHONEPE-${Date.now()}`,
    status: "SUCCESS",
    amount_paise: 49900,
    currency: "INR",
    customer_name: "Test Customer",
    customer_email: email,
    customer_phone: "9999999999",
    shipping_address: {
      line1: "705, Tower 4&5, The Amaryllis - Phase 1",
      line2: "Kishanganj",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110007",
    },
    phonepe_redirect_url: null,
    created_at: nowIso,
    updated_at: nowIso,
    paid_at: nowIso,
  };
  const items: StoredOrderItem[] = [
    {
      product_slug: "side-eye-sour",
      product_name: "Side Eye Sour",
      unit_price_paise: 39900,
      quantity: 1,
      line_total_paise: 39900,
    },
    {
      product_slug: "shipping",
      product_name: "Shipping",
      unit_price_paise: 10000,
      quantity: 1,
      line_total_paise: 10000,
    },
  ];
  const invoice = await createPaidZohoInvoice({ order, items });
  let emailSent = false;

  if (shouldSendEmail) {
    await sendOrderConfirmationEmail({
      order,
      items: items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        lineTotalPaise: item.line_total_paise,
      })),
      attachments: [
        {
          filename: invoice.pdf.filename,
          content: invoice.pdf.content,
          contentType: "application/pdf",
        },
      ],
    });
    emailSent = true;
  }

  return NextResponse.json({
    ok: true,
    message:
      "Created a real Zoho test invoice/payment and downloaded its PDF. Void/delete it in Zoho if you do not want to keep it.",
    merchantOrderId,
    contactId: invoice.contactId,
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    paymentId: invoice.paymentId,
    pdfFilename: invoice.pdf.filename,
    pdfBytes: invoice.pdf.content.byteLength,
    emailSent,
    emailTo: emailSent ? email : null,
  });
}
