import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCart } from '../src/lib/cart/normalize';
import { productStructuredData, serializeJsonLd } from '../src/lib/seo/structuredData';
import { CATALOG_PRODUCTS } from '../src/lib/catalog/products';
import { CartValidationError, priceCheckoutItems } from '../src/lib/checkout/pricing';

test('saved carts merge aliases, restore authoritative prices and discard invalid entries', () => {
  const cart = normalizeCart([null, {}, {slug: 'unknown'}, {slug:'side-eye-sour',quantity:2,price:1}, {slug:'sideeyesour',quantity:3}]);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 5);
  assert.equal(cart[0].price, 399);
  assert.deepEqual(normalizeCart('invalid'), []);
  assert.equal(normalizeCart([{slug:'sideeyesour',quantity:Infinity}])[0].quantity, 1);
  assert.equal(normalizeCart([{slug:'sideeyesour',quantity:1000}])[0].quantity, 99);
});
test('structured data matches server checkout for every product and bundle', async () => {
  for (const product of CATALOG_PRODUCTS) {
    const schema = productStructuredData(product, 'https://www.sourboo.com');
    const priced = await priceCheckoutItems([{slug:product.slug,quantity:1}]);
    assert.equal(Number(schema.offers.price)*100, priced.subtotalPaise);
    assert.equal(schema.offers.priceCurrency, 'INR');
    assert.equal(schema.url, `https://www.sourboo.com/product/${product.slug}`);
    assert.ok(schema.image.every(image => image.startsWith('https://www.sourboo.com/')));
    assert.ok(!('aggregateRating' in schema));
  }
});
test('JSON-LD serialization cannot break out of the script element', () => {
  const value = {name: '</script><script>alert(1)</script>'};
  assert.ok(!serializeJsonLd(value).includes('<'));
  assert.deepEqual(JSON.parse(serializeJsonLd(value)), value);
});
test('customer cart errors have a distinct type for HTTP 400 handling', async () => {
  await assert.rejects(priceCheckoutItems([{slug:'missing',quantity:1}]), CartValidationError);
  await assert.rejects(priceCheckoutItems(Array.from({length:101},()=>({slug:'sideeyesour',quantity:1}))), CartValidationError);
});
