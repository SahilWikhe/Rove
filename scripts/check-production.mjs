// Read-only live smoke check. Never submits synthetic analytics events.
import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

const origin = 'https://rove-neon.vercel.app';
const page = await fetch(origin, { signal: AbortSignal.timeout(15_000) });
assert.equal(page.status, 200, 'Production homepage is unavailable');
assert.match(await page.text(), /Rove — A better way to get there/);
assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
assert.equal(page.headers.get('x-frame-options'), 'DENY');
assert.match(
  page.headers.get('content-security-policy') || '',
  /'nonce-[^']+'/,
);

// Analytics activation can lag behind READY. Retry only its idempotent GET.
let script;
for (let attempt = 0; attempt < 12; attempt++) {
  script = await fetch(`${origin}/_vercel/insights/script.js`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (script.ok && /javascript/.test(script.headers.get('content-type') || ''))
    break;
  await script.body?.cancel();
  if (attempt < 11) await setTimeout(10_000);
}
assert.equal(script?.status, 200, 'Vercel analytics script is not ready');
assert.match(script.headers.get('content-type') || '', /javascript/);
assert.match(await script.text(), /pageview/);
console.log(
  'Production homepage, security headers, and analytics script verified.',
);
