import { NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCheckoutItems } from '@/src/lib/checkout/pricing';
import { SHIPPING_CHARGE_PAISE, calculatePayableTotalPaise } from '@/src/lib/checkout/totals';

export const runtime = 'nodejs';

const quoteRequestSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
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
    const payableTotalPaise = calculatePayableTotalPaise(pricedCart.subtotalPaise);

    return NextResponse.json({
      ok: true,
      items: pricedCart.items,
      subtotalPaise: pricedCart.subtotalPaise,
      shippingPaise: SHIPPING_CHARGE_PAISE,
      payableTotalPaise,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to calculate cart total.',
      },
      { status: 500 },
    );
  }
}
