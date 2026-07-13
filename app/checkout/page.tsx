'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import { useCart } from '../components/cart/CartProvider';
import { formatInr } from '@/src/lib/cart/price';
import { calculateShippingPaiseForItems } from '@/src/lib/checkout/totals';

type CheckoutFormState = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

type CreatePaymentResponse = {
  ok: boolean;
  checkoutUrl?: string;
  error?: string;
};

type QuoteResponse = {
  ok: boolean;
  items?: Array<{
    slug: string;
    lineTotalPaise: number;
  }>;
  subtotalPaise?: number;
  discountPaise?: number;
  discountPercent?: number;
  appliedDiscountCode?: string | null;
  shippingPaise?: number;
  payableTotalPaise?: number;
  error?: string;
};

async function parseJsonSafely<T>(response: Response): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    const snippet = raw.slice(0, 180).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Expected JSON from API but received non-JSON (status ${response.status}). ${snippet}`,
    );
  }
}

const initialFormState: CheckoutFormState = {
  fullName: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
};

const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

function toTrimmedCheckoutForm(formState: CheckoutFormState): CheckoutFormState {
  return {
    fullName: formState.fullName.trim(),
    email: formState.email.trim(),
    phone: formState.phone.trim(),
    line1: formState.line1.trim(),
    line2: formState.line2.trim(),
    city: formState.city.trim(),
    state: formState.state.trim(),
    postalCode: formState.postalCode.trim(),
  };
}

function getCheckoutValidationError(
  formState: CheckoutFormState,
  items: Array<{ slug: string; quantity: number }>,
): string | null {
  if (items.length === 0) return 'Your cart is empty.';
  if (items.some((item) => !item.slug?.trim() || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return 'Your cart has an invalid item. Please remove it and add it again.';
  }
  if (formState.fullName.length < 2) return 'Please enter your full name.';
  if (formState.phone.length < 8) return 'Please enter a valid phone number.';
  if (formState.line1.length < 3) return 'Please enter your address.';
  if (formState.city.length < 2) return 'Please enter your city.';
  if (formState.state.length < 2) return 'Please enter your state.';
  if (formState.postalCode.length < 3) return 'Please enter your postal code.';
  return null;
}

export default function CheckoutPage() {
  const { items, subtotal, discountCode, discountAmount, discountPercent } = useCart();
  const [formState, setFormState] = useState<CheckoutFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverSubtotal, setServerSubtotal] = useState<number | null>(null);
  const [serverDiscount, setServerDiscount] = useState<number | null>(null);
  const [serverDiscountPercent, setServerDiscountPercent] = useState<number | null>(null);
  const [serverAppliedDiscountCode, setServerAppliedDiscountCode] = useState<string | null>(null);
  const [serverShipping, setServerShipping] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [serverLineTotalsBySlug, setServerLineTotalsBySlug] = useState<Record<string, number>>({});
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const fallbackShipping = useMemo(
    () => calculateShippingPaiseForItems(items) / 100,
    [items],
  );
  const discountForDisplay = useMemo(
    () => (typeof serverDiscount === 'number' ? serverDiscount : discountAmount),
    [discountAmount, serverDiscount],
  );
  const appliedDiscountCodeForDisplay = useMemo(
    () => serverAppliedDiscountCode || discountCode,
    [discountCode, serverAppliedDiscountCode],
  );
  const discountPercentForDisplay = useMemo(
    () => (typeof serverDiscountPercent === 'number' ? serverDiscountPercent : discountPercent),
    [discountPercent, serverDiscountPercent],
  );
  const totalPayable = useMemo(
    () =>
      typeof serverTotal === 'number'
        ? serverTotal
        : Math.max(0, subtotal + fallbackShipping - discountAmount),
    [discountAmount, fallbackShipping, serverTotal, subtotal],
  );
  const subtotalForDisplay = useMemo(
    () => (typeof serverSubtotal === 'number' ? serverSubtotal : subtotal),
    [serverSubtotal, subtotal],
  );
  const shippingForDisplay = useMemo(
    () => (typeof serverShipping === 'number' ? serverShipping : fallbackShipping),
    [fallbackShipping, serverShipping],
  );

  const canSubmit = items.length > 0 && !isSubmitting;

  useEffect(() => {
    if (items.length === 0) {
      setServerSubtotal(null);
      setServerDiscount(null);
      setServerDiscountPercent(null);
      setServerAppliedDiscountCode(null);
      setServerShipping(null);
      setServerTotal(null);
      setServerLineTotalsBySlug({});
      setQuoteError(null);
      return;
    }

    let cancelled = false;

    async function loadQuote() {
      try {
        const response = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          body: JSON.stringify({
            items: items.map((item) => ({
              slug: item.slug,
              name: item.name,
              quantity: item.quantity,
            })),
            discountCode,
          }),
        });

        const result = await parseJsonSafely<QuoteResponse>(response);
        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Unable to calculate payable total.');
        }

        if (cancelled) return;

        const subtotalRupees =
          typeof result.subtotalPaise === 'number' ? result.subtotalPaise / 100 : null;
        const discountRupees =
          typeof result.discountPaise === 'number' ? result.discountPaise / 100 : null;
        const shippingRupees =
          typeof result.shippingPaise === 'number' ? result.shippingPaise / 100 : null;
        const totalRupees =
          typeof result.payableTotalPaise === 'number' ? result.payableTotalPaise / 100 : null;
        const lineTotalsBySlug = Array.isArray(result.items)
          ? result.items.reduce<Record<string, number>>((acc, item) => {
              if (!item || typeof item.slug !== 'string') return acc;
              if (typeof item.lineTotalPaise !== 'number') return acc;
              acc[item.slug] = item.lineTotalPaise / 100;
              return acc;
            }, {})
          : {};

        setServerSubtotal(subtotalRupees);
        setServerDiscount(discountRupees);
        setServerDiscountPercent(
          typeof result.discountPercent === 'number' ? result.discountPercent : null,
        );
        setServerAppliedDiscountCode(result.appliedDiscountCode || null);
        setServerShipping(shippingRupees);
        setServerTotal(totalRupees);
        setServerLineTotalsBySlug(lineTotalsBySlug);
        setQuoteError(null);
      } catch {
        if (cancelled) return;
        setServerSubtotal(null);
        setServerDiscount(null);
        setServerDiscountPercent(null);
        setServerAppliedDiscountCode(null);
        setServerShipping(null);
        setServerTotal(null);
        setServerLineTotalsBySlug({});
        setQuoteError(GENERIC_BACKEND_ERROR);
      }
    }

    void loadQuote();

    return () => {
      cancelled = true;
    };
  }, [discountCode, items]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage(null);
    const checkoutForm = toTrimmedCheckoutForm(formState);
    const validationError = getCheckoutValidationError(checkoutForm, items);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/payments/phonepe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            name: item.name,
            quantity: item.quantity,
          })),
          discountCode,
          customer: {
            fullName: checkoutForm.fullName,
            email: checkoutForm.email,
            phone: checkoutForm.phone,
          },
          shippingAddress: {
            line1: checkoutForm.line1,
            line2: checkoutForm.line2,
            city: checkoutForm.city,
            state: checkoutForm.state,
            postalCode: checkoutForm.postalCode,
          },
        }),
      });

      const result = await parseJsonSafely<CreatePaymentResponse>(response);
      if (!response.ok || !result.ok || !result.checkoutUrl) {
        throw new Error(result.error || 'Failed to initiate payment.');
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : GENERIC_BACKEND_ERROR);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <h1 className="text-center text-[clamp(3rem,6vw,6rem)] leading-[0.92] text-[#E61E6E] font-coolvetica">
          Checkout
        </h1>

        <p className="mx-auto mt-3 max-w-[920px] text-center text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.08] text-[#2E2A2A] font-schoolbell">
          please fill your details carefully
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-[#FCF4FD] p-5 md:p-7"
          >
            <p className="text-[clamp(1.8rem,2.4vw,2.6rem)] leading-none text-[#E61E6E] font-coolvetica">
              Delivery details
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Full Name</span>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={formState.fullName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Email</span>
                <input
                  required
                  type="email"
                  maxLength={160}
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Phone</span>
                <input
                  required
                  type="tel"
                  minLength={8}
                  maxLength={18}
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Address Line 1</span>
                <input
                  required
                  minLength={3}
                  maxLength={200}
                  value={formState.line1}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, line1: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Address Line 2 (optional)</span>
                <input
                  maxLength={200}
                  value={formState.line2}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, line2: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">City</span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">State</span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={formState.state}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, state: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Postal Code</span>
                <input
                  required
                  minLength={3}
                  maxLength={12}
                  value={formState.postalCode}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                  className="rounded-xl border border-[#C6C6B9] bg-white px-3 py-2 text-[#1D1D1D]"
                />
              </label>
            </div>

            {errorMessage ? (
              <p className="mt-4 text-[1rem] text-[#9F1C74] font-schoolbell">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 inline-flex w-[min(100%,360px)] aspect-[256/67] items-center justify-center bg-[url('/home/readmyrantcta.svg')] bg-contain bg-center bg-no-repeat px-8 text-center text-[clamp(1.2rem,2.1vw,2rem)] leading-none text-[#FFF8F8] font-schoolbell transition duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E61E7A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative -translate-y-[6px]">
                {isSubmitting ? 'redirecting to phonepe...' : 'pay with phonepe →'}
              </span>
            </button>
          </form>

          <aside className="h-fit rounded-3xl border-2 border-[#A8D64A] bg-[#F4FFD9] p-5 md:p-7">
            <p className="text-[clamp(1.8rem,2.4vw,2.6rem)] leading-none text-[#2D5A0D] font-coolvetica">
              Your order
            </p>

            {items.length === 0 ? (
              <div className="mt-5">
                <p className="text-[1.2rem] leading-[1.2] text-[#2E2A2A] font-schoolbell">
                  Your cart is empty.
                </p>
                <Link
                  href="/product"
                  className="mt-3 inline-block text-[1.1rem] text-[#2D5A0D] underline font-schoolbell"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-3">
                  {items.map((item) => (
                    <div key={item.slug} className="flex items-start justify-between gap-3">
                      <p className="text-[1.05rem] leading-[1.2] text-[#2E2A2A]">
                        {item.name} x {item.quantity}
                      </p>
                      <p className="text-[1.05rem] leading-[1.2] text-[#2E2A2A]">
                        {formatInr(serverLineTotalsBySlug[item.slug] ?? item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[#9FCF41] pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[1.25rem] leading-none text-[#2D5A0D] font-coolvetica">
                      Items ({itemCount})
                    </p>
                    <p className="text-[1.25rem] leading-none text-[#2D5A0D] font-coolvetica">
                      {formatInr(subtotalForDisplay)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[1.1rem] leading-none text-[#365A17] font-schoolbell">Shipping</p>
                    <p className="text-[1.1rem] leading-none text-[#365A17] font-schoolbell">
                      {formatInr(shippingForDisplay)}
                    </p>
                  </div>
                  {appliedDiscountCodeForDisplay ? (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[1.1rem] leading-none text-[#365A17] font-schoolbell">
                        Discount ({appliedDiscountCodeForDisplay})
                      </p>
                      <p className="text-[1.1rem] leading-none text-[#365A17] font-schoolbell">
                        -{formatInr(discountForDisplay)}
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between border-t border-[#9FCF41] pt-3">
                    <p className="text-[1.35rem] leading-none text-[#2D5A0D] font-coolvetica">Total payable</p>
                    <p className="text-[1.35rem] leading-none text-[#2D5A0D] font-coolvetica">
                      {formatInr(totalPayable)}
                    </p>
                  </div>
                  {appliedDiscountCodeForDisplay ? (
                    <p className="mt-2 text-[0.95rem] leading-[1.2] text-[#365A17] font-schoolbell">
                      {discountPercentForDisplay}% off applied with {appliedDiscountCodeForDisplay}.
                    </p>
                  ) : null}
                  {quoteError ? (
                    <p className="mt-2 text-[0.95rem] leading-[1.2] text-[#9F1C74] font-schoolbell">
                      {quoteError}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
