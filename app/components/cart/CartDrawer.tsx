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
        
        <div className="relative h-16 w-16 overflow-hidden rounded border border-[#D7D7C8] bg-[#FFFF88] md:h-20 md:w-20">
          <Image src={image} alt={name} fill sizes="80px" quality={76} className="object-contain" />
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
        className={`absolute right-0 top-0 h-full w-full max-w-none overflow-hidden bg-[#E61E6E] px-5 pb-9 pt-6 text-[#E9E8D8] transition-transform duration-300 sm:max-w-[92%] md:max-w-[62%] md:px-8 md:pt-7 lg:max-w-[54%] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-14 bg-[#E61E6E] md:block md:-skew-x-[9deg]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={closeCart}
              className="text-[52px] leading-none text-[#E9E8D8] font-coolvetica md:text-[64px]"
            >
              X
            </button>
            <div className="relative mr-1 -top-[30%] h-[126px] w-[190px] md:h-[164px] md:w-[220px]">
              <Image
                src="/cart/cartlogo.svg"
                alt="Sourboo logo"
                fill
                className="object-contain object-right"
              />
            </div>
          </div>

          <div className="mt-6 border-b border-[#D7D7C8]/80 pb-3 md:mt-8 md:pb-4">
            <p className="text-[clamp(1.95rem,3vw,3rem)] leading-none font-schoolbell">Cart ({totalItems})</p>
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
              <p className="text-[clamp(2rem,2.8vw,3rem)] leading-none font-schoolbell">Subtotal</p>
              <p className="text-[clamp(2rem,2.8vw,3rem)] leading-none font-schoolbell">{formatInr(subtotal)}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end md:mt-10">
            <Link
              href="/checkout"
              onClick={closeCart}
              className="inline-flex w-[min(100%,330px)] aspect-[286/74] items-center justify-center bg-[url('/cart/cartcta.svg')] bg-contain bg-center bg-no-repeat px-5 text-[clamp(1.6rem,2.4vw,2.5rem)] leading-none text-[#4A4743] font-coolvetica transition duration-200 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF88]"
            >
              Checkout →
            </Link>
          </div>

          <p className="mt-auto pt-8 text-[clamp(1.45rem,1.9vw,2.1rem)] leading-none text-[#D7D7C8] font-coolvetica">
            Taxes and shipping calculated at checkout*
          </p>
       
        </div>
      </aside>
    </div>
  );
}
