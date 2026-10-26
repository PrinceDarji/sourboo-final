import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';

// A separate production server, always stopped. No successful payment/order requests.
const origin = 'http://127.0.0.1:3217';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3217'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', data => { logs += data; });
server.stderr.on('data', data => { logs += data; });
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw Error(logs);
    if (logs.includes('Ready')) { ready = true; break; }
    await pause(500);
  }
  assert.ok(ready, logs);
  const get = path => fetch(origin + path, { redirect: 'manual' });
  const productPrices = {sideeyesour:399, tamarintease:399, 'tamarind-twins':719, 'lemon-lovers':729, 'sour-sampler':729, 'sourboo-stash':1299};
  for (const path of ['/', '/about', '/contact', '/join', '/product', '/privacy-policy', '/shipping-policy', '/refund-policy', '/terms-and-conditions', ...Object.keys(productPrices).map(slug=>`/product/${slug}`)]) {
    const start = performance.now();
    const response = await get(path); const html = await response.text();
    assert.equal(response.status, 200, path);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, `canonical: ${path}`);
    assert.equal(new URL(canonical).href, new URL(path, 'https://www.sourboo.com').href);
    assert.ok(html.includes('<h1'), `heading: ${path}`);
    assert.ok(html.includes('name="description"'), `description: ${path}`);
    if (path.startsWith('/product/')) {
      const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
      const product = data.find(d=>d['@type']==='Product');
      assert.ok(product, path);
      assert.equal(Number(product.offers.price), productPrices[path.split('/').pop()]);
    }
    console.log(`PASS ${path}: ${Math.round(performance.now()-start)}ms (local response, not Core Web Vitals)`);
  }
  for (const [path,dest] of [['/home','/'],['/product/side-eye-sour','/product/sideeyesour'],['/product/tamarin-tease','/product/tamarintease']]) {
    const res = await get(path);
    assert.equal(res.status,308,path); assert.equal(res.headers.get('location'),dest,path);
  }
  const checkout = await (await get('/checkout')).text();
  assert.ok(/name="robots" content="[^"]*noindex/.test(checkout));
  const missing = await get('/product/not-a-real-product');
  assert.equal(missing.status,404);
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.ok(!sitemap.includes('/home<')); assert.ok(!sitemap.includes('<lastmod>'));
  for (const [slug,price] of Object.entries(productPrices)) {
    assert.ok(sitemap.includes(`/product/${slug}<`));
    const response=await fetch(origin+'/api/checkout/quote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:[{slug,quantity:1}],discountCode:''})});
    const q=await response.json(); assert.equal(response.status,200); assert.equal(q.payableTotalPaise,(price+100)*100);
  }
  for (const path of ['/api/checkout/quote','/api/payments/phonepe/create']) {
    const response = await fetch(origin+path,{method:'POST',headers:{'content-type':'application/json'},body:'{bad'});
    assert.equal(response.status,400,path);
  }
  const invalid = await fetch(origin+'/api/checkout/quote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:[{slug:'unknown',quantity:1}]})});
  assert.equal(invalid.status,400);
  console.log('PASS canonical redirects, noindex, 404, sitemap, six checkout quotes and malformed requests');
} catch (error) {
  console.error(error); process.exitCode=1;
} finally {
  server.kill('SIGTERM');
}
