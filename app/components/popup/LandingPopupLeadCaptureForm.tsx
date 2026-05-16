'use client';

import Image from 'next/image';
import { type FormEvent, useState } from 'react';
import type { LandingPopupLeadCaptureContent } from '@/src/lib/sanity/landingPopup';
import { CoolRascalText } from '../MixedFont';

type LandingPopupLeadCaptureFormProps = {
  copy: LandingPopupLeadCaptureContent;
  selectedOptionLabel: string;
  selectedOptionHref: string;
  sourcePath?: string;
};

type SubmitState = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
};

type PopupLeadErrorResponse = {
  error?: string;
  issues?: Array<{
    path?: Array<string | number>;
  }>;
};

function hasEnoughPhoneDigits(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPopupLeadErrorMessage(payload: PopupLeadErrorResponse | null): string {
  if (!payload) {
    return 'could not save right now. try again in a bit.';
  }

  if (
    Array.isArray(payload.issues) &&
    payload.issues.some((issue) => Array.isArray(issue.path) && issue.path.includes('email'))
  ) {
    return 'email is not in the right format';
  }

  if (typeof payload.error === 'string') {
    const normalizedError = payload.error.toLowerCase();

    if (normalizedError.includes('email')) {
      return 'email is not in the right format';
    }

    if (normalizedError.includes('phone')) {
      return 'please enter a valid phone number.';
    }
  }

  return 'could not save right now. try again in a bit.';
}

function CopyCodeIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M11 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-7Zm0 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M6 8a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-1h-2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h1V8H6Z" />
    </svg>
  );
}

export default function LandingPopupLeadCaptureForm({
  copy,
  selectedOptionLabel,
  selectedOptionHref,
  sourcePath,
}: LandingPopupLeadCaptureFormProps) {
  const lineOneText = `${copy.headingPrefix} ${selectedOptionLabel}`.trim();
  const lineTwoText = `${copy.discountPrefix} ${copy.discountMain}`.trim();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState.status === 'submitting') return;

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedPhone) {
      setSubmitState({
        status: 'error',
        message: 'please enter both email and phone number.',
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setSubmitState({
        status: 'error',
        message: 'email is not in the right format',
      });
      return;
    }

    if (!hasEnoughPhoneDigits(trimmedPhone)) {
      setSubmitState({
        status: 'error',
        message: 'please enter a valid phone number.',
      });
      return;
    }

    setSubmitState({ status: 'submitting' });

    try {
      const response = await fetch('/api/popup-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: trimmedPhone,
          selectedOptionLabel,
          selectedOptionHref,
          sourcePath,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as PopupLeadErrorResponse | null;
        setSubmitState({
          status: 'error',
          message: getPopupLeadErrorMessage(errorPayload),
        });
        return;
      }

      setSubmitState({ status: 'success', message: copy.successMessage });
      setHasCopiedCode(false);
      setEmail('');
      setPhone('');
    } catch {
      setSubmitState({
        status: 'error',
        message: 'could not save right now. try again in a bit.',
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(copy.successCode);
      setHasCopiedCode(true);
    } catch {
      setHasCopiedCode(false);
    }
  };

  if (submitState.status === 'success') {
    return (
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-center justify-center text-center">
        <p
          className="max-w-[760px] leading-[0.95] font-schoolbell text-[#E61E6E]"
          style={{
            fontSize: 'clamp(26px, 4.4vw, 54px)',
          }}
        >
          {submitState.message}
        </p>

        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label={
              hasCopiedCode
                ? 'coupon code copied'
                : `copy coupon code ${copy.successCode}`
            }
            className="inline-flex min-h-[72px] items-center gap-4 rounded-full border-2 border-[#E61E6E] bg-[#FFF7D6] px-6 py-3 text-[#E61E6E] transition hover:opacity-90"
          >
            <span
              className="block leading-none font-coolvetica"
              style={{
                fontSize: 'clamp(26px, 4.2vw, 40px)',
                letterSpacing: '0.12em',
              }}
            >
              {copy.successCode}
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E61E6E]/30 bg-[#FFEFC0] text-[#E61E6E]">
              <CopyCodeIcon copied={hasCopiedCode} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[900px] text-center">
      <h1
        className="text-center leading-[0.9]"
        style={{
          fontSize: 'clamp(38px, 6.4vw, 92px)',
          color: '#E61E6E',
        }}
      >
        <CoolRascalText
          as="span"
          text={lineOneText}
          pattern="alternate"
          startWith="base"
          baseClassName="text-[#E61E6E]"
          accentClassName="text-[#E61E6E]"
        />
      </h1>

      <p
        className="mt-2 text-center leading-[0.95]"
        style={{
          fontSize: 'clamp(28px, 4.8vw, 66px)',
          color: '#E61E6E',
        }}
      >
        <CoolRascalText
          as="span"
          text={lineTwoText}
          pattern="alternate"
          startWith="accent"
          baseClassName="text-[#E61E6E]"
          accentClassName="text-[#E61E6E]"
        />
      </p>

      <p
        className="mx-auto mt-5 max-w-[700px] text-center font-schoolbell"
        style={{
          fontSize: 'clamp(16px, 2vw, 28px)',
          lineHeight: 1,
          color: '#202020',
        }}
      >
        {copy.prompt}
      </p>

      <form className="mx-auto mt-5 w-full max-w-[420px]" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            className="h-[74px] w-full rounded-full border-2 border-[#E61E6E] bg-[#F8F0F8] px-6 text-[clamp(1.05rem,2vw,1.42rem)] leading-none text-[#1E1E1E] font-schoolbell outline-none transition placeholder:text-[#6F5F6B] focus:border-[#CC0F5F] sm:h-[82px]"
            required
          />
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={copy.phonePlaceholder}
            autoComplete="tel"
            className="h-[74px] w-full rounded-full border-2 border-[#E61E6E] bg-[#F8F0F8] px-6 text-[clamp(1.05rem,2vw,1.42rem)] leading-none text-[#1E1E1E] font-schoolbell outline-none transition placeholder:text-[#6F5F6B] focus:border-[#CC0F5F] sm:h-[82px]"
            required
          />
        </div>

        {submitState.status === 'error' ? (
          <p className="mt-3 text-center text-[clamp(1rem,1.7vw,1.3rem)] leading-none text-[#B4232B] font-schoolbell">
            {submitState.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitState.status === 'submitting'}
          className="relative mx-auto mt-5 flex h-[84px] w-[min(92vw,420px)] items-center justify-center disabled:opacity-70"
        >
          {copy.ctaBackgroundImageSrc ? (
            <Image
              src={copy.ctaBackgroundImageSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, 420px"
              className="pointer-events-none object-contain select-none"
            />
          ) : null}
          <span
            className="relative z-10 -translate-x-2 -translate-y-1 px-6 text-center leading-none font-schoolbell md:translate-x-0 md:translate-y-0"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.3rem)',
              color: '#FFF9D5',
            }}
          >
            {submitState.status === 'submitting' ? 'unlocking...' : copy.ctaLabel}
          </span>
        </button>
      </form>

      <p
        className="mt-3 text-center font-schoolbell"
        style={{
          fontSize: 'clamp(1rem, 1.6vw, 1.35rem)',
          color: '#2A2A2A',
          lineHeight: 1.05,
        }}
      >
        {copy.disclaimer}
      </p>
    </div>
  );
}
