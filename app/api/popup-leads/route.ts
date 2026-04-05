import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPopupLead } from '@/src/lib/popup/leads';

export const runtime = 'nodejs';
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

const popupLeadRequestSchema = z.object({
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(8).max(24),
  selectedOptionLabel: z.string().trim().min(1).max(80),
  selectedOptionHref: z.string().trim().max(500).optional().default(''),
  sourcePath: z.string().trim().max(500).optional().default(''),
});

function hasEnoughPhoneDigits(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8;
}

function asSafeHref(value: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('/')) return value;

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function asSafeSourcePath(value: string): string | undefined {
  if (!value.startsWith('/')) return undefined;
  return value;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = popupLeadRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid popup lead payload.',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!hasEnoughPhoneDigits(data.phone)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please enter a valid phone number.',
        },
        { status: 400 },
      );
    }

    await createPopupLead({
      email: data.email,
      phone: data.phone,
      selectedOptionLabel: data.selectedOptionLabel,
      selectedOptionHref: asSafeHref(data.selectedOptionHref),
      sourcePath: asSafeSourcePath(data.sourcePath),
    });

    return NextResponse.json({ ok: true });
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
