'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import { useCart } from '../components/cart/CartProvider';
import { formatInr } from '@/src/lib/cart/price';

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

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [formState, setFormState] = useState<CheckoutFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const canSubmit = items.length > 0 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage(null);
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
            quantity: item.quantity,
          })),
          customer: {
            fullName: formState.fullName,
            email: formState.email,
            phone: formState.phone,
          },
          shippingAddress: {
            line1: formState.line1,
            line2: formState.line2,
            city: formState.city,
            state: formState.state,
            postalCode: formState.postalCode,
          },
        }),
      });

      const result = await parseJsonSafely<CreatePaymentResponse>(response);
      if (!response.ok || !result.ok || !result.checkoutUrl) {
        throw new Error(result.error || 'Failed to initiate payment.');
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start payment.');
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
          Pay securely with PhonePe
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border-2 border-[#DF78B6] bg-[#F8FBEF] p-5 md:p-7"
          >
            <p className="text-[clamp(1.8rem,2.4vw,2.6rem)] leading-none text-[#E61E6E] font-coolvetica">
              Delivery details
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[1.1rem] text-[#2E2A2A] font-schoolbell">Full Name</span>
                <input
                  required
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
              className="mt-6 inline-flex min-h-[46px] items-center rounded-full border-[5px] border-[#DF78B6] bg-[#FDF2F8] px-6 py-2 text-[clamp(1.3rem,2vw,2rem)] leading-none text-[#9F1C74] font-coolvetica disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Redirecting to PhonePe...' : 'Pay With PhonePe'}
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
                        {formatInr(item.price * item.quantity)}
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
                      {formatInr(subtotal)}
                    </p>
                  </div>
                  <p className="mt-2 text-[0.95rem] leading-[1.2] text-[#365A17] font-schoolbell">
                    Final amount is recalculated on server from Sanity price before payment.
                  </p>
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
