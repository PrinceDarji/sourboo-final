import { NextResponse } from 'next/server';
import {
  tryInsertPaymentEvent,
  updateOrderFromStatus,
} from '@/src/lib/payments/orders';
import {
  createWebhookEventIdempotencyKey,
  extractWebhookMerchantOrderId,
  extractWebhookState,
  verifyPhonePeWebhookAuthorization,
} from '@/src/lib/payments/phonepe/webhook';
import { mapPhonePeStateToOrderStatus } from '@/src/lib/payments/phonepe/types';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

export async function POST(request: Request) {
  try {
    const authorizationHeader = request.headers.get('authorization');
    const isAuthorized = verifyPhonePeWebhookAuthorization(authorizationHeader);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized webhook request.',
        },
        { status: 401 },
      );
    }

    const rawBody = await request.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Webhook payload must be valid JSON.',
        },
        { status: 400 },
      );
    }

    const merchantOrderId = extractWebhookMerchantOrderId(payload);
    if (!merchantOrderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'merchantOrderId not found in webhook payload.',
        },
        { status: 400 },
      );
    }

    const idempotencyKey = `webhook:${merchantOrderId}:${createWebhookEventIdempotencyKey(rawBody)}`;
    const inserted = await tryInsertPaymentEvent({
      merchantOrderId,
      source: 'webhook',
      idempotencyKey,
      payload,
    });

    if (!inserted) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
      });
    }

    const phonePeState = extractWebhookState(payload) || 'PENDING';
    const status = mapPhonePeStateToOrderStatus(phonePeState);

    await updateOrderFromStatus({
      merchantOrderId,
      status,
      rawStatusResponse: payload,
    });

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      status,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: GENERIC_BACKEND_ERROR,
      },
      { status: 500 },
    );
  }
}
