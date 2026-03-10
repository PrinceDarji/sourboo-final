import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  getOrderByMerchantOrderId,
  tryInsertPaymentEvent,
  updateOrderFromStatus,
} from '@/src/lib/payments/orders';
import { fetchPhonePeOrderStatus } from '@/src/lib/payments/phonepe/client';
import {
  isTerminalOrderStatus,
  mapPhonePeStateToOrderStatus,
} from '@/src/lib/payments/phonepe/types';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

function extractStringByKey(input: unknown, key: string): string | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const queue: unknown[] = [input];
  const normalized = key.toLowerCase();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    for (const [k, value] of Object.entries(current as Record<string, unknown>)) {
      if (k.toLowerCase() === normalized && typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return undefined;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const merchantOrderId = url.searchParams.get('merchantOrderId')?.trim();
    const sourceParam = url.searchParams.get('source')?.trim().toLowerCase();
    const source = sourceParam === 'return_page' ? 'return_page' : 'status_poll';

    if (!merchantOrderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'merchantOrderId is required.',
        },
        { status: 400 },
      );
    }

    const existingOrder = await getOrderByMerchantOrderId(merchantOrderId);
    if (!existingOrder) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found.',
        },
        { status: 404 },
      );
    }

    const phonePeStatusResponse = await fetchPhonePeOrderStatus(merchantOrderId);
    const phonePeState =
      extractStringByKey(phonePeStatusResponse, 'state') ||
      extractStringByKey(phonePeStatusResponse, 'paymentState') ||
      'PENDING';
    const phonePeOrderId = extractStringByKey(phonePeStatusResponse, 'orderId');

    const orderStatus = mapPhonePeStateToOrderStatus(phonePeState);

    await updateOrderFromStatus({
      merchantOrderId,
      phonepeOrderId: phonePeOrderId,
      status: orderStatus,
      rawStatusResponse: phonePeStatusResponse,
      errorContext: (phonePeStatusResponse as { errorContext?: unknown }).errorContext,
    });

    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(phonePeStatusResponse), 'utf8')
      .digest('hex');

    await tryInsertPaymentEvent({
      merchantOrderId,
      source,
      idempotencyKey: `${source}:${merchantOrderId}:${payloadHash}`,
      payload: phonePeStatusResponse,
    });

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      orderStatus,
      phonePeState,
      isTerminal: isTerminalOrderStatus(orderStatus),
      amountPaise:
        typeof (phonePeStatusResponse as { amount?: number }).amount === 'number'
          ? (phonePeStatusResponse as { amount: number }).amount
          : existingOrder.amount_paise,
      phonePeOrderId: phonePeOrderId || existingOrder.phonepe_order_id,
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
