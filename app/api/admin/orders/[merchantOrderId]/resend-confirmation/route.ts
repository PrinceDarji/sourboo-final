import { NextResponse } from 'next/server';
import { resendOrderConfirmationEmail } from '@/src/lib/payments/orders';

export const runtime = 'nodejs';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ merchantOrderId: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { merchantOrderId } = await context.params;
  if (!merchantOrderId?.trim()) {
    return NextResponse.json({ ok: false, error: 'merchantOrderId is required.' }, { status: 400 });
  }

  try {
    await resendOrderConfirmationEmail(merchantOrderId.trim());
    return NextResponse.json({ ok: true, merchantOrderId: merchantOrderId.trim() });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Confirmation resend failed.',
      },
      { status: 500 },
    );
  }
}
