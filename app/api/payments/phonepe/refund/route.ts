import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPhonePeRefund,
} from '@/src/lib/payments/phonepe/client';
import {
  mapPhonePeRefundStateToRefundStatus,
} from '@/src/lib/payments/phonepe/types';
import {
  createRefundRecord,
  getRefundableOrderByMerchantOrderId,
  getReservedRefundAmountPaise,
} from '@/src/lib/payments/refunds';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

const createRefundSchema = z.object({
  merchantOrderId: z.string().trim().min(3).max(80),
  amountPaise: z.number().int().min(100).optional(),
  reason: z.string().trim().max(250).optional(),
});

function generateMerchantRefundId(): string {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RFD${Date.now()}${suffix}`;
}

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

export async function POST(request: Request) {
  let generatedMerchantRefundId: string | null = null;

  try {
    const json = await request.json();
    const parsed = createRefundSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid refund payload.',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { merchantOrderId, reason } = parsed.data;

    const order = await getRefundableOrderByMerchantOrderId(merchantOrderId);
    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found.',
        },
        { status: 404 },
      );
    }

    if (order.status !== 'SUCCESS') {
      return NextResponse.json(
        {
          ok: false,
          error: `Refund is allowed only for SUCCESS orders. Current status: ${order.status}.`,
        },
        { status: 400 },
      );
    }

    const reservedRefundAmountPaise = await getReservedRefundAmountPaise(order.id);
    const refundableBalancePaise = Math.max(0, order.amount_paise - reservedRefundAmountPaise);

    if (refundableBalancePaise < 100) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No refundable balance left for this order.',
        },
        { status: 400 },
      );
    }

    const amountPaise = parsed.data.amountPaise ?? refundableBalancePaise;

    if (amountPaise > refundableBalancePaise) {
      return NextResponse.json(
        {
          ok: false,
          error: `Requested refund exceeds refundable balance (${refundableBalancePaise} paise).`,
        },
        { status: 400 },
      );
    }

    generatedMerchantRefundId = generateMerchantRefundId();

    const phonePeCreateRefundResponse = await createPhonePeRefund({
      merchantRefundId: generatedMerchantRefundId,
      originalMerchantOrderId: merchantOrderId,
      amount: amountPaise,
    });

    const phonePeRefundId = extractStringByKey(phonePeCreateRefundResponse, 'refundId');
    const phonePeRefundState =
      extractStringByKey(phonePeCreateRefundResponse, 'state') || 'PENDING';
    const refundStatus = mapPhonePeRefundStateToRefundStatus(phonePeRefundState);

    await createRefundRecord({
      orderId: order.id,
      merchantRefundId: generatedMerchantRefundId,
      amountPaise,
      status: refundStatus,
      reason,
      phonepeRefundId: phonePeRefundId,
      createResponse: phonePeCreateRefundResponse,
    });

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      merchantRefundId: generatedMerchantRefundId,
      phonePeRefundId,
      refundStatus,
      phonePeRefundState,
      amountPaise,
      refundableBalanceAfterPaise: refundableBalancePaise - amountPaise,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: GENERIC_BACKEND_ERROR,
        merchantRefundId: generatedMerchantRefundId,
      },
      { status: 500 },
    );
  }
}
