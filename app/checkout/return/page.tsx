'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/app/components/about/AboutNavbar';
import SiteFooter from '@/app/components/SiteFooter';
import { useCart } from '@/app/components/cart/CartProvider';
import { formatInr } from '@/src/lib/cart/price';

type OrderStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

type PaymentStatusResponse = {
  ok: boolean;
  error?: string;
  merchantOrderId?: string;
  orderStatus?: OrderStatus;
  phonePeState?: string;
  isTerminal?: boolean;
  amountPaise?: number;
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

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 2500;
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

function statusTitle(status: OrderStatus | null): string {
  switch (status) {
    case 'SUCCESS':
      return 'Payment successful';
    case 'FAILED':
      return 'Payment failed';
    case 'EXPIRED':
      return 'Payment expired';
    case 'CREATED':
    case 'PENDING':
      return 'Payment in progress';
    default:
      return 'Checking payment status';
  }
}

function statusDescription(status: OrderStatus | null): string {
  switch (status) {
    case 'SUCCESS':
      return 'Your order is confirmed. We will dispatch it soon.';
    case 'FAILED':
      return 'The payment did not complete. You can retry checkout.';
    case 'EXPIRED':
      return 'The payment session expired. Please place the order again.';
    case 'CREATED':
    case 'PENDING':
      return 'Please wait while we confirm the transaction from PhonePe.';
    default:
      return 'Fetching latest payment status...';
  }
}

function CheckoutReturnFallback() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="mx-auto w-full max-w-[900px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="rounded-3xl border-2 border-[#DF78B6] bg-[#F8FBEF] p-6 md:p-9">
          <h1 className="text-center text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.92] text-[#E61E6E] font-coolvetica">
            Checking payment status
          </h1>

          <p className="mx-auto mt-4 max-w-[680px] text-center text-[clamp(1.25rem,2.4vw,1.95rem)] leading-[1.1] text-[#2E2A2A] font-schoolbell">
            Loading payment details...
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CheckoutReturnPageContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const merchantOrderId = searchParams.get('merchantOrderId')?.trim() || '';

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [phonePeState, setPhonePeState] = useState<string | null>(null);
  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pollCountRef = useRef(0);
  const clearCartOnceRef = useRef(false);

  const isTerminal = status === 'SUCCESS' || status === 'FAILED' || status === 'EXPIRED';

  const amountLabel = useMemo(() => {
    if (typeof amountPaise !== 'number' || !Number.isFinite(amountPaise)) return null;
    return formatInr(amountPaise / 100);
  }, [amountPaise]);

  const fetchStatus = useCallback(
    async (markLoading: boolean) => {
      if (!merchantOrderId) {
        setLoading(false);
        setErrorMessage('We could not verify this payment. Please try checkout again.');
        return;
      }

      if (markLoading) {
        setLoading(true);
      }

      try {
        const response = await fetch(
          `/api/payments/phonepe/status?merchantOrderId=${encodeURIComponent(merchantOrderId)}&source=return_page`,
          { method: 'GET', cache: 'no-store' },
        );

        const result = await parseJsonSafely<PaymentStatusResponse>(response);
        if (!response.ok || !result.ok || !result.orderStatus) {
          throw new Error(result.error || 'Unable to fetch payment status.');
        }

        setStatus(result.orderStatus);
        setPhonePeState(result.phonePeState || null);
        setAmountPaise(typeof result.amountPaise === 'number' ? result.amountPaise : null);
        setErrorMessage(null);
      } catch {
        setErrorMessage(GENERIC_BACKEND_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [merchantOrderId],
  );

  useEffect(() => {
    if (status === 'SUCCESS' || status === 'FAILED' || status === 'EXPIRED') {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    async function runPoll() {
      if (stopped) return;

      await fetchStatus(pollCountRef.current === 0);

      pollCountRef.current += 1;

      if (stopped) return;
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) return;
      if (status === 'SUCCESS' || status === 'FAILED' || status === 'EXPIRED') return;

      timer = setTimeout(runPoll, POLL_INTERVAL_MS);
    }

    runPoll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [fetchStatus, status]);

  useEffect(() => {
    if (status !== 'SUCCESS') return;
    if (clearCartOnceRef.current) return;

    clearCart();
    clearCartOnceRef.current = true;
  }, [status, clearCart]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="mx-auto w-full max-w-[900px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="rounded-3xl border-2 border-[#DF78B6] bg-[#F8FBEF] p-6 md:p-9">
          <h1 className="text-center text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.92] text-[#E61E6E] font-coolvetica">
            {statusTitle(status)}
          </h1>

          <p className="mx-auto mt-4 max-w-[680px] text-center text-[clamp(1.25rem,2.4vw,1.95rem)] leading-[1.1] text-[#2E2A2A] font-schoolbell">
            {statusDescription(status)}
          </p>

          <div className="mx-auto mt-7 grid max-w-[600px] gap-3 rounded-2xl border border-[#D8D9CC] bg-white p-4 md:p-5">
            <p className="text-[1rem] leading-none text-[#656565]">Merchant Order ID</p>
            <p className="break-all text-[1.1rem] leading-[1.2] text-[#1D1D1D] font-coolvetica">
              {merchantOrderId || 'Not available'}
            </p>

            {phonePeState ? (
              <p className="text-[1rem] leading-[1.2] text-[#3E3E3E]">
                PhonePe state: <span className="font-coolvetica">{phonePeState}</span>
              </p>
            ) : null}

            {amountLabel ? (
              <p className="text-[1rem] leading-[1.2] text-[#3E3E3E]">
                Amount: <span className="font-coolvetica">{amountLabel}</span>
              </p>
            ) : null}
          </div>

          {loading ? (
            <p className="mt-5 text-center text-[1.05rem] text-[#646464] font-schoolbell">
              Updating payment status...
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-5 text-center text-[1.05rem] text-[#9F1C74] font-schoolbell">{errorMessage}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!isTerminal ? (
              <button
                type="button"
                onClick={() => {
                  pollCountRef.current = 0;
                  void fetchStatus(true);
                }}
                className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#A8D64A] bg-[#F4FFD9] px-5 py-2 text-[1.1rem] leading-none text-[#2D5A0D] font-schoolbell"
              >
                Check again
              </button>
            ) : null}

            <Link
              href={status === 'SUCCESS' ? '/' : '/checkout'}
              className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#DF78B6] bg-[#FDF2F8] px-5 py-2 text-[1.1rem] leading-none text-[#9F1C74] font-schoolbell"
            >
              {status === 'SUCCESS' ? 'Go to home' : 'Back to checkout'}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<CheckoutReturnFallback />}>
      <CheckoutReturnPageContent />
    </Suspense>
  );
}
