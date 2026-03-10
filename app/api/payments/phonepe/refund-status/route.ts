import { NextResponse } from 'next/server';
import { fetchPhonePeRefundStatus } from '@/src/lib/payments/phonepe/client';
import {
  isTerminalRefundStatus,
  mapPhonePeRefundStateToRefundStatus,
} from '@/src/lib/payments/phonepe/types';
import { getRefundByMerchantRefundId, updateRefundRecord } from '@/src/lib/payments/refunds';

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
    const merchantRefundId = url.searchParams.get('merchantRefundId')?.trim();

    if (!merchantRefundId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'merchantRefundId is required.',
        },
        { status: 400 },
      );
    }

    const existingRefund = await getRefundByMerchantRefundId(merchantRefundId);
    if (!existingRefund) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Refund not found.',
        },
        { status: 404 },
      );
    }

    const phonePeRefundStatusResponse = await fetchPhonePeRefundStatus(merchantRefundId);
    const phonePeRefundState =
      extractStringByKey(phonePeRefundStatusResponse, 'state') || 'PENDING';
    const phonePeRefundId = extractStringByKey(phonePeRefundStatusResponse, 'refundId');

    const refundStatus = mapPhonePeRefundStateToRefundStatus(phonePeRefundState);

    await updateRefundRecord({
      merchantRefundId,
      status: refundStatus,
      phonepeRefundId: phonePeRefundId,
      statusResponse: phonePeRefundStatusResponse,
      errorContext: (phonePeRefundStatusResponse as { errorContext?: unknown }).errorContext,
    });

    return NextResponse.json({
      ok: true,
      merchantRefundId,
      refundStatus,
      phonePeRefundState,
      phonePeRefundId,
      amountPaise:
        typeof (phonePeRefundStatusResponse as { amount?: number }).amount === 'number'
          ? (phonePeRefundStatusResponse as { amount: number }).amount
          : existingRefund.amount_paise,
      isTerminal: isTerminalRefundStatus(refundStatus),
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
