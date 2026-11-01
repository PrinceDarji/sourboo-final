import Image from 'next/image';

export default function ProductLoading() {
  return (
    <main aria-busy="true" aria-label="Loading products" className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#E9ECD9] px-4">
      <Image
        src="/home/hero-placeholder.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={78}
        className="object-cover object-center"
      />
      <p role="status" className="relative z-10 rounded-2xl bg-[#E9ECD9]/95 px-6 py-4 text-center text-2xl text-[#2F4918] font-schoolbell sm:text-3xl">
        Loading your crunch…
      </p>
    </main>
  );
}
