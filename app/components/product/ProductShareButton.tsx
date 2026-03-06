'use client';

import Image from 'next/image';

type ProductShareButtonProps = {
  productName: string;
};

export default function ProductShareButton({ productName }: ProductShareButtonProps) {
  async function copyCurrentUrl(url: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const helper = document.createElement('textarea');
    helper.value = url;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    document.execCommand('copy');
    document.body.removeChild(helper);
  }

  async function handleShare() {
    const url = window.location.href;
    const shareTitle = `${productName} | Sourboo`;
    const shareText = `Check out ${productName} from Sourboo.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      }

      await copyCurrentUrl(url);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      try {
        await copyCurrentUrl(url);
      } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${productName}`}
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E61E6E] focus-visible:ring-offset-2"
    >
      <Image src="/shareicon.svg" alt="" aria-hidden width={34} height={34} className="h-[34px] w-[34px]" />
    </button>
  );
}
