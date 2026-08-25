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

  const [smtpResult, zohoResult] = await Promise.allSettled([
    verifyOrderConfirmationEmailTransport(),
    verifyZohoBooksConnection(),
  ]);
  const smtpVerified = smtpResult.status === "fulfilled";
  const zohoVerified = zohoResult.status === "fulfilled";

  return NextResponse.json(
    {
      ok: smtpVerified && zohoVerified,
      environment,
      smtp: smtpVerified ? "verified" : "unavailable_or_unverified",
      zoho: zohoVerified ? "verified" : "unavailable_or_unverified",
      errors: {
        smtp:
          smtpResult.status === "rejected"
            ? smtpResult.reason instanceof Error
              ? smtpResult.reason.message
              : "Zoho SMTP verification failed."
            : null,
        zoho:
          zohoResult.status === "rejected"
            ? zohoResult.reason instanceof Error
              ? zohoResult.reason.message
              : "Zoho Books verification failed."
            : null,
      },
    },
    { status: smtpVerified && zohoVerified ? 200 : 503 },
  );
}
