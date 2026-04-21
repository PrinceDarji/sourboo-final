import { NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCheckoutItems } from '@/src/lib/checkout/pricing';
import { calculateDiscountPaise } from '@/src/lib/checkout/discountCodes';
import { calculatePayableTotalPaise, calculateShippingPaiseForItems } from '@/src/lib/checkout/totals';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

const quoteRequestSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  discountCode: z.string().trim().max(40).optional().default(''),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
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
