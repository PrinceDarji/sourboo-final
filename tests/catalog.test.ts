import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CATALOG_PRODUCTS, findCatalogProduct } from '../src/lib/catalog/products';
import { priceCheckoutItems } from '../src/lib/checkout/pricing';
import { calculatePayableTotalPaise, calculateShippingPaiseForItems } from '../src/lib/checkout/totals';

const expected = [39900, 39900, 71900, 72900, 72900, 129900];
test('all six products have approved prices, local images, and galleries', () => {
  assert.deepEqual(CATALOG_PRODUCTS.map(p => p.pricePaise), expected);
  assert.equal(new Set(CATALOG_PRODUCTS.map(p => p.slug)).size, 6);
  for (const p of CATALOG_PRODUCTS) {
    assert.equal(Number(p.price.replace('₹', '')) * 100, p.pricePaise);
    assert.equal(p.galleryImages[0], p.jarImage);
    assert.ok(p.galleryImages.length >= 3);
    for (const image of p.galleryImages) assert.ok(existsSync(`public${image}`), image);
  }
});
test('checkout prices every single and bundle without any network access', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Sanity is unavailable'); };
  try {
    for (const [i, p] of CATALOG_PRODUCTS.entries()) {
      const cart = await priceCheckoutItems([{ slug: p.slug, name: 'tampered name', quantity: 2 }]);
      assert.equal(cart.subtotalPaise, expected[i] * 2);
      assert.equal(cart.items[0].name, p.name);
      assert.equal(calculateShippingPaiseForItems(cart.items), 10000);
      assert.equal(calculatePayableTotalPaise(cart.subtotalPaise, 10000), expected[i] * 2 + 10000);
    }
  } finally { globalThis.fetch = oldFetch; }
});
test('mixed cart pays shipping once; empty cart has no shipping', async () => {
  const cart = await priceCheckoutItems(CATALOG_PRODUCTS.map(p => ({ slug: p.slug, quantity: 1 })));
  assert.equal(cart.subtotalPaise, 427400);
  assert.equal(calculatePayableTotalPaise(cart.subtotalPaise, calculateShippingPaiseForItems(cart.items)), 437400);
  assert.equal(calculateShippingPaiseForItems([]), 0);
});
test('legacy links resolve and duplicate aliases merge safely', async () => {
  assert.equal(findCatalogProduct('tamarin-twins-tangy-tamarind-pickled-gherkins')?.pricePaise, 71900);
  const cart = await priceCheckoutItems([{ slug: 'side-eye-sour', quantity: 1 }, { slug: 'sideeyesour', quantity: 2 }]);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(cart.subtotalPaise, 119700);
});
test('unknown products, forged names and invalid quantities cannot be ordered', async () => {
  await assert.rejects(priceCheckoutItems([]));
  await assert.rejects(priceCheckoutItems([{ slug: 'unknown', name: 'SIDE EYE SOUR', quantity: 1 }]));
  for (const quantity of [0, -1, 1.5, 100, NaN, Infinity]) {
    await assert.rejects(priceCheckoutItems([{ slug: 'sideeyesour', quantity }]));
  }
  await assert.rejects(priceCheckoutItems([{ slug: 'sideeyesour', quantity: 99 }, { slug: 'side-eye-sour', quantity: 1 }]));
});
