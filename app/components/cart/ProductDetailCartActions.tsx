'use client';

import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { parsePriceLabel } from '@/src/lib/cart/price';

type ProductDetailCartActionsProps = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
};

export default function ProductDetailCartActions({
  slug,
  name,
  priceLabel,
  image,
}: ProductDetailCartActionsProps) {
  const { addItem, openCart } = useCart();
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById('product-footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const baseItem = {
    slug,
    name,
    price: parsePriceLabel(priceLabel),
    image,
  };

  function handleAddToCart() {
    addItem(baseItem);
    openCart();
  }

  return (
    <div data-footer-visible={footerVisible} className="product-purchase-actions mt-4 flex flex-wrap items-center justify-center gap-3 md:mt-6 md:gap-4">
      <button
        type="button"
        onClick={handleAddToCart}
        className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#A8D64A] bg-[#F4FFD9] px-5 py-2 text-[clamp(1.4rem,2vw,2rem)] leading-none text-[#2D5A0D] font-schoolbell transition hover:scale-[1.01]"
      >
        <span className="hidden xl:inline">add to cart</span>
        <span className="xl:hidden">Buy now · {priceLabel}</span>
      </button>
    </div>
  );
}
