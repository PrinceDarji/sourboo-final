import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CartValidationError, priceCheckoutItems } from '@/src/lib/checkout/pricing';
import { calculateDiscountPaise } from '@/src/lib/checkout/discountCodes';
import { calculatePayableTotalPaise, calculateShippingPaiseForItems } from '@/src/lib/checkout/totals';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

const discountCodeSchema = z.preprocess(
  (value) => (value == null ? '' : value),
  z.string().trim().max(40),
);

const quoteRequestSchema = z.object({
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
});

export async function POST(request: Request) {
  try {
    let json: unknown;
    try { json = await request.json(); } catch {
      return NextResponse.json({ ok: false, error: 'Request must contain valid JSON.' }, { status: 400 });
    }
    const parsed = quoteRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid cart payload.',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const pricedCart = await priceCheckoutItems(parsed.data.items);
    const shippingPaise = calculateShippingPaiseForItems(pricedCart.items);
    const appliedDiscount = calculateDiscountPaise(
      pricedCart.subtotalPaise,
      parsed.data.discountCode,
    );
    const payableTotalPaise = calculatePayableTotalPaise(
      pricedCart.subtotalPaise,
      shippingPaise,
      appliedDiscount.discountPaise,
    );

    return NextResponse.json({
      ok: true,
      items: pricedCart.items,
      subtotalPaise: pricedCart.subtotalPaise,
      discountPaise: appliedDiscount.discountPaise,
      discountPercent: appliedDiscount.discountPercent,
      appliedDiscountCode: appliedDiscount.code,
      shippingPaise,
      payableTotalPaise,
    });
  } catch (error) {
    if (error instanceof CartValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error('Checkout quote failed', error);
    return NextResponse.json(
      {
        ok: false,
        error: GENERIC_BACKEND_ERROR,
      },
      { status: 500 },
    );
  }
}
