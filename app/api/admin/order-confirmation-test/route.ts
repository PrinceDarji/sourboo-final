import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/src/lib/email/orderConfirmation';

export const runtime = 'nodejs';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: { to?: unknown };
  try {
    body = (await request.json()) as { to?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required.' }, { status: 400 });
  }

  const to = typeof body.to === 'string' ? body.to.trim() : '';
  if (!isValidEmail(to)) {
    return NextResponse.json({ ok: false, error: 'A valid recipient email is required.' }, { status: 400 });
  }

  try {
    await sendOrderConfirmationEmail({
      order: {
        merchant_order_id: `TEST-SB-${Date.now()}`,
        amount_paise: 74500,
        currency: 'INR',
        customer_name: 'Sourboo Test',
        customer_email: to,
      },
      items: [{ name: 'Test order — no payment taken', quantity: 1, lineTotalPaise: 74500 }],
    });

    return NextResponse.json({ ok: true, to });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Test email failed.' },
      { status: 502 },
    );
  }
}
