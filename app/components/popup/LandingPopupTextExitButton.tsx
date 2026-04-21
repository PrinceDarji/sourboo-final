'use client';

import useLandingPopupExit from './useLandingPopupExit';

type LandingPopupTextExitButtonProps = {
  fromPath?: string;
  className?: string;
  label?: string;
};

export default function LandingPopupTextExitButton({
  fromPath,
  className,
  label = 'no thanks take me to the website',
}: LandingPopupTextExitButtonProps) {
  const handleExit = useLandingPopupExit(fromPath);

  return (
    <button
      type="button"
      onClick={handleExit}
      className={`px-4 text-center font-schoolbell text-[clamp(1rem,1.5vw,1.35rem)] leading-none text-[#2A2A2A] transition hover:opacity-70 ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
