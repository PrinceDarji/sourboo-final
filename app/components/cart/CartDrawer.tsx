'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatInr } from '@/src/lib/cart/price';

function CartItemRow({
  slug,
  name,
  price,
  image,
  quantity,
}: {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="border-b border-[#D7D7C8]/80 py-4 md:py-5">
      <div className="grid grid-cols-[28px_64px_1fr_auto] items-center gap-3 md:grid-cols-[34px_82px_1fr_auto] md:gap-4">
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={() => removeItem(slug)}
          className="text-[20px] leading-none text-[#E9E8D8] transition hover:opacity-75 md:text-[24px]"
        >
          🗑
        </button>
        
        <div className="relative h-16 w-16 overflow-hidden rounded border border-[#D7D7C8] bg-[#6B55D8] md:h-20 md:w-20">
          <Image src={image} alt={name} fill unoptimized className="object-contain" />
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-[clamp(1.15rem,1.8vw,2rem)] leading-[1.05] text-[#E9E8D8] font-coolvetica">
            {name}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => updateQuantity(slug, quantity - 1)}
              className="h-9 w-9 rounded-2xl border-2 border-[#D7D7C8] text-[26px] leading-none text-[#D7D7C8] md:h-10 md:w-10"
            >
              -
            </button>
            <span className="min-w-6 text-center text-[clamp(1.2rem,1.8vw,1.8rem)] text-[#E9E8D8] font-coolvetica">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(slug, quantity + 1)}
              className="h-9 w-9 rounded-2xl border-2 border-[#D7D7C8] text-[26px] leading-none text-[#D7D7C8] md:h-10 md:w-10"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-[clamp(1.3rem,2vw,2.3rem)] leading-none text-[#E9E8D8] font-coolvetica">
          {formatInr(price * quantity)}
        </p>
      </div>
      <p className="mt-3 text-[clamp(1.4rem,1.8vw,2rem)] leading-none text-[#E9E8D8] font-schoolbell">
            Pre-orders only
          </p>
    </div>
  );
}

export default function CartDrawer() {
  const { isOpen, closeCart, items, totalItems, subtotal } = useCart();

  return (
    <div
      className={`fixed inset-0 z-[120] transition ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={closeCart}
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/20 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-none overflow-hidden bg-[#7566E5] px-5 pb-9 pt-6 text-[#E9E8D8] transition-transform duration-300 sm:max-w-[92%] md:max-w-[62%] md:px-8 md:pt-7 lg:max-w-[54%] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-14 bg-[#7566E5] md:block md:-skew-x-[9deg]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={closeCart}
              className="text-[52px] leading-none text-[#E9E8D8] font-coolvetica md:text-[64px]"
            >
              X
            </button>
            <p className="pr-2 text-[clamp(2.15rem,3.4vw,4.2rem)] leading-none text-[#1C948A] font-coolvetica">
              sourboo
            </p>
          </div>

          <div className="mt-6 border-b border-[#D7D7C8]/80 pb-3 md:mt-8 md:pb-4">
            <p className="text-[clamp(1.95rem,3vw,3rem)] leading-none font-coolvetica">Cart ({totalItems})</p>
          </div>

          <div className="mt-1 max-h-[40vh] overflow-y-auto pr-1 md:max-h-[44vh]">
            {items.length > 0 ? (
              items.map((item) => (
                <CartItemRow
                  key={item.slug}
                  slug={item.slug}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  quantity={item.quantity}
                />
              ))
            ) : (
              <div className="py-8 text-center md:py-12">
                <p className="text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.06] font-coolvetica">
                  Your cart is empty.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-[#D7D7C8]/80 pt-4 md:mt-5 md:pt-5">
            <div className="flex items-center justify-between">
              <p className="text-[clamp(2rem,2.8vw,3rem)] leading-none font-coolvetica">Subtotal</p>
              <p className="text-[clamp(2rem,2.8vw,3rem)] leading-none font-coolvetica">{formatInr(subtotal)}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end md:mt-10">
            <Link
              href="/checkout"
              className="inline-flex items-center rounded-full border-[8px] border-[#DF78B6] px-6 py-2 text-[clamp(1.9rem,2.6vw,2.8rem)] leading-none font-coolvetica transition hover:opacity-85"
            >
              Checkout →
            </Link>
          </div>

          <p className="mt-auto pt-8 text-[clamp(1.45rem,1.9vw,2.1rem)] leading-none text-[#D7D7C8] font-coolvetica">
            Taxes and shipping calculated at checkout
          </p>
       
        </div>
      </aside>
    </div>
  );
}
