'use client';

import { useCart } from './CartProvider';
import { parsePriceLabel } from '@/src/lib/cart/price';

type QuickBuyButtonProps = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
  className: string;
  children: React.ReactNode;
};

export default function QuickBuyButton({
  slug,
  name,
  priceLabel,
  image,
  className,
  children,
}: QuickBuyButtonProps) {
  const { addItem, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          slug,
          name,
          image,
          price: parsePriceLabel(priceLabel),
        });
        openCart();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
