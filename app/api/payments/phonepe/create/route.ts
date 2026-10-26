import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CartValidationError, priceCheckoutItems } from '@/src/lib/checkout/pricing';
import { calculateDiscountPaise } from '@/src/lib/checkout/discountCodes';
import { calculatePayableTotalPaise, calculateShippingPaiseForItems } from '@/src/lib/checkout/totals';
import {
  createOrderWithItems,
  tryInsertPaymentEvent,
  updateOrderAfterCreatePayment,
  updateOrderFromStatus,
} from '@/src/lib/payments/orders';
import { createPhonePePayment } from '@/src/lib/payments/phonepe/client';
import { getPhonePeConfig } from '@/src/lib/payments/phonepe/config';
import { mapPhonePeStateToOrderStatus } from '@/src/lib/payments/phonepe/types';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

const discountCodeSchema = z.preprocess(
  (value) => (value == null ? '' : value),
  z.string().trim().max(40),
);

const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        name: z.string().trim().max(160).optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1).max(100),
  discountCode: discountCodeSchema,
  customer: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().min(8).max(18),
  }),
  shippingAddress: z.object({
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).optional().default(''),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(3).max(12),
  }),
});

function generateMerchantOrderId(): string {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SB${Date.now()}${suffix}`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveOrigin(request: Request): string {
  const config = getPhonePeConfig();
  if (config.redirectBaseUrl) {
    return trimTrailingSlash(config.redirectBaseUrl);
  }

  const directOrigin = new URL(request.url).origin;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return directOrigin;
}

function resolveGatewayAmountPaise(catalogSubtotalPaise: number): {
  amountPaise: number;
  isTestOverride: boolean;
} {
  const rawOverride = process.env.PHONEPE_TEST_AMOUNT_PAISE?.trim();
  if (!rawOverride) {
    return { amountPaise: catalogSubtotalPaise, isTestOverride: false };
  }

  const overrideAmount = Number.parseInt(rawOverride, 10);
  if (!Number.isInteger(overrideAmount) || overrideAmount < 100) {
    throw new Error('PHONEPE_TEST_AMOUNT_PAISE must be an integer >= 100 (paise).');
  }

  const config = getPhonePeConfig();
  if (config.environment !== 'UAT') {
    throw new Error('PHONEPE_TEST_AMOUNT_PAISE is allowed only when PHONEPE_ENV=UAT.');
  }

  return { amountPaise: overrideAmount, isTestOverride: true };
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
  let merchantOrderId: string | null = null;

  try {
    let json: unknown;
    try { json = await request.json(); } catch {
      return NextResponse.json({ ok: false, error: 'Request must contain valid JSON.' }, { status: 400 });
    }
    const parsed = checkoutRequestSchema.safeParse(json);

    if (!parsed.success) {
      const issueSummary = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'payload'}: ${issue.message}`)
        .join('; ');
      console.error('Invalid PhonePe checkout payload', issueSummary, parsed.error.issues);
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid checkout payload: ${issueSummary}`,
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { items, customer, shippingAddress, discountCode } = parsed.data;
    const pricedCart = await priceCheckoutItems(items);
    const shippingPaise = calculateShippingPaiseForItems(pricedCart.items);
    const appliedDiscount = calculateDiscountPaise(pricedCart.subtotalPaise, discountCode);
    const payableTotalPaise = calculatePayableTotalPaise(
      pricedCart.subtotalPaise,
      shippingPaise,
      appliedDiscount.discountPaise,
    );
    const gatewayAmount = resolveGatewayAmountPaise(payableTotalPaise);

    if (payableTotalPaise <= 0) {
      console.error('Invalid PhonePe checkout payable amount', {
        catalogSubtotalPaise: pricedCart.subtotalPaise,
        shippingPaise,
        discountPaise: appliedDiscount.discountPaise,
        payableTotalPaise,
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid payable amount. Please review your cart.',
        },
        { status: 400 },
      );
    }

    merchantOrderId = generateMerchantOrderId();

    await createOrderWithItems({
      merchantOrderId,
      amountPaise: gatewayAmount.amountPaise,
      currency: 'INR',
      status: 'CREATED',
      customer,
      shippingAddress,
      items: pricedCart.items,
      cartSnapshot: {
        items,
        customer,
        shippingAddress,
        catalogSubtotalPaise: pricedCart.subtotalPaise,
        enteredDiscountCode: discountCode || null,
        appliedDiscountCode: appliedDiscount.code,
        discountPaise: appliedDiscount.discountPaise,
        discountPercent: appliedDiscount.discountPercent,
        shippingPaise,
        payableTotalPaise,
        gatewayAmountPaise: gatewayAmount.amountPaise,
        testAmountOverrideApplied: gatewayAmount.isTestOverride,
      },
    });

    const origin = resolveOrigin(request);
    const redirectUrl = `${origin}/checkout/return?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;

    const createPaymentPayload = {
      merchantOrderId,
      amount: gatewayAmount.amountPaise,
      paymentFlow: {
        type: 'PG_CHECKOUT' as const,
        merchantUrls: {
          redirectUrl,
        },
      },
      expireAfter: 1200,
      metaInfo: {
        orderSource: 'sourboo-web',
      },
    };

    const createPaymentResponse = await createPhonePePayment(createPaymentPayload);

    const phonePeOrderId = extractStringByKey(createPaymentResponse, 'orderId');
    const checkoutUrl = extractStringByKey(createPaymentResponse, 'redirectUrl');
    const phonePeStateRaw =
      extractStringByKey(createPaymentResponse, 'state') ||
      extractStringByKey(createPaymentResponse, 'paymentState') ||
      'PENDING';

    if (!checkoutUrl) {
      throw new Error('PhonePe did not return redirectUrl in create payment response.');
    }

    const orderStatus = mapPhonePeStateToOrderStatus(phonePeStateRaw);

    await updateOrderAfterCreatePayment({
      merchantOrderId,
      phonepeOrderId: phonePeOrderId,
      redirectUrl: checkoutUrl,
      status: orderStatus,
      createResponse: createPaymentResponse,
    });

    await tryInsertPaymentEvent({
      merchantOrderId,
      source: 'create',
      idempotencyKey: `create:${merchantOrderId}`,
      payload: createPaymentResponse,
    });

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      checkoutUrl,
      amountPaise: gatewayAmount.amountPaise,
      catalogSubtotalPaise: pricedCart.subtotalPaise,
      discountPaise: appliedDiscount.discountPaise,
      discountPercent: appliedDiscount.discountPercent,
      appliedDiscountCode: appliedDiscount.code,
      shippingPaise,
      payableTotalPaise,
      testAmountOverrideApplied: gatewayAmount.isTestOverride,
      state: phonePeStateRaw,
    });
  } catch (error) {
    if (error instanceof CartValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error('PhonePe checkout create failed', error);
    if (merchantOrderId) {
      try {
        await updateOrderFromStatus({
          merchantOrderId,
          status: 'FAILED',
          rawStatusResponse: null,
          errorContext: {
            source: 'create_route',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch {
        // swallow secondary persistence failure
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: GENERIC_BACKEND_ERROR,
      },
      { status: 500 },
    );
  }
}
