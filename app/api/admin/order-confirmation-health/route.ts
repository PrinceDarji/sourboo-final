import { NextResponse } from "next/server";
import {
  getOrderConfirmationEmailConfiguration,
  verifyOrderConfirmationEmailTransport,
} from "@/src/lib/email/orderConfirmation";
import { verifyZohoBooksConnection } from "@/src/lib/invoices/zoho";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  return (
    Boolean(secret) &&
    request.headers.get("authorization") === `Bearer ${secret}`
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const environment = getOrderConfirmationEmailConfiguration();
  const missing = environment
    .filter((item) => !item.configured)
    .map((item) => item.name);
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, environment, missing },
      { status: 503 },
    );
  }

  try {
    await Promise.all([
      verifyOrderConfirmationEmailTransport(),
      verifyZohoBooksConnection(),
    ]);
    return NextResponse.json({
      ok: true,
      environment,
      smtp: "verified",
      zoho: "verified",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        environment,
        smtp: "unavailable_or_unverified",
        zoho: "unavailable_or_unverified",
        error:
          error instanceof Error
            ? error.message
            : "Integration verification failed.",
      },
      { status: 503 },
    );
  }
}
