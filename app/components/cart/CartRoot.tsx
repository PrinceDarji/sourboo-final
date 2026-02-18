'use client';

import CartDrawer from './CartDrawer';
import { CartProvider } from './CartProvider';

export default function CartRoot({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
