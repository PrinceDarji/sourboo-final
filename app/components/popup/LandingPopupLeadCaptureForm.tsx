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

const SUCCESS_MESSAGE = 'you are in! your 5% unlock is saved!';

function hasEnoughPhoneDigits(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8;
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
        setSubmitState({
          status: 'error',
          message: 'could not save right now. try again in a bit.',
        });
        return;
      }

      setSubmitState({ status: 'success', message: SUCCESS_MESSAGE });
      setEmail('');
      setPhone('');
    } catch {
      setSubmitState({
        status: 'error',
        message: 'could not save right now. try again in a bit.',
      });
    }
  };

  if (submitState.status === 'success') {
    return (
      <div className="mx-auto flex w-full max-w-[900px] items-center justify-center text-center">
        <p
          className="max-w-[520px] leading-[0.95] font-schoolbell text-[#E61E6E]"
          style={{
            fontSize: 'clamp(30px, 4.8vw, 58px)',
          }}
        >
          {submitState.message}
        </p>
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
          className="relative mx-auto mt-5 flex h-[74px] w-[min(92vw,420px)] items-center justify-center disabled:opacity-70"
        >
          <Image
            src={copy.ctaBackgroundImageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, 420px"
            className="pointer-events-none object-contain select-none"
          />
          <span
            className="relative z-10 px-6 text-center leading-none font-schoolbell"
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
