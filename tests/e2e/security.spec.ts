import { test, expect } from '@playwright/test';

test('HTML has fresh nonces, restrictive headers, and no reusable shared cache', async ({
  request,
  page,
}) => {
  const first = await request.get('/');
  const second = await request.get('/', {
    headers: {
      'Content-Security-Policy': "script-src 'nonce-attacker'",
      'x-nonce': 'attacker',
    },
  });
  const headers = first.headers();
  const nonce =
    headers['content-security-policy'].match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toMatch(/^[A-Za-z0-9+/]{24}$/);
  expect(second.headers()['content-security-policy']).not.toContain(nonce!);
  expect(second.headers()['content-security-policy']).not.toContain('attacker');
  expect(headers['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  expect(
    headers['content-security-policy']
      .split(';')
      .find((s) => s.trim().startsWith('script-src')),
  ).not.toMatch(/unsafe-inline|unsafe-eval/);
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['cache-control']).toContain('no-store');
  const html = await first.text();
  // An inert browser parser handles HTML syntax without executing the scripts.
  const inlineNonces = await page.evaluate((source) => {
    const parsed = new DOMParser().parseFromString(source, 'text/html');
    return Array.from(parsed.querySelectorAll('script'))
      .filter(
        (script) => !script.hasAttribute('src') && script.textContent.trim(),
      )
      .map((script) => script.nonce);
  }, html);
  expect(inlineNonces.length).toBeGreaterThan(0);
  for (const scriptNonce of inlineNonces) expect(scriptNonce).toBe(nonce);
});

test('read-only site rejects write methods and action-shaped requests', async ({
  request,
}) => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = await request.fetch('/', {
      method,
      headers: {
        'Next-Action': 'unregistered-action',
        Origin: 'https://untrusted.example',
      },
      data: '{}',
    });
    expect(response.status()).toBe(405);
    expect(response.headers().allow).toBe('GET, HEAD');
  }
  const head = await request.head('/');
  expect(head.status()).toBe(200);
  expect(await head.body()).toHaveLength(0);
});

test('private files and unknown routes are not exposed', async ({
  request,
}) => {
  for (const path of [
    '/.env',
    '/.env.local',
    '/.git/config',
    '/package.json',
    '/vite.config.ts',
    '/@fs/etc/passwd',
    '/does-not-exist',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(await response.text()).not.toMatch(
      /root:x:0:0|\[remote "origin"\]|"dependencies"\s*:/,
    );
  }
});

test('browser blocks untrusted inline scripts and external data transmission', async ({
  page,
}) => {
  await page.route('**/_vercel/insights/script.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const violations: string[] = [];
    document.addEventListener('securitypolicyviolation', (event) =>
      violations.push(event.effectiveDirective),
    );
    const script = document.createElement('script');
    script.textContent = 'window.__untrustedScriptRan = true';
    document.head.appendChild(script);
    let blocked = false;
    try {
      await fetch('https://untrusted.example.test/collect');
    } catch {
      blocked = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      executed: Boolean(Reflect.get(window, '__untrustedScriptRan')),
      blocked,
      violations,
    };
  });
  expect(result.executed).toBe(false);
  expect(result.blocked).toBe(true);
  expect(result.violations).toContain('script-src-elem');
  expect(result.violations).toContain('connect-src');
});
