import test from 'node:test';
import assert from 'node:assert/strict';
import { createSecurityHeaders } from '../lib/security.ts';

test('production policy blocks scripts without a nonce and browser capabilities the site does not use', () => {
  const headers = createSecurityHeaders('abcdefghijklmnopqrstuvwx');
  const directives = Object.fromEntries(
    headers['Content-Security-Policy'].split('; ').map((d) => {
      const [key, ...value] = d.split(' ');
      return [key, value.join(' ')];
    }),
  );
  assert(!directives['script-src'].includes('unsafe-'));
  for (const key of [
    'object-src',
    'base-uri',
    'frame-ancestors',
    'form-action',
  ])
    assert.equal(directives[key], "'none'");
  assert.equal(directives['connect-src'], "'self'");
  assert.match(headers['Permissions-Policy'], /camera=\(\)/);
  assert.match(headers['Cache-Control'], /no-store/);
});

test('malformed or attacker-controlled nonce values are rejected', () => {
  for (const value of [
    '',
    'short',
    "abcdefghijklmnopqrstuvwx'; script-src *",
    '<script>',
    'a'.repeat(25),
  ]) {
    assert.throws(() => createSecurityHeaders(value));
  }
});

test('development-only allowances never leak into production policy', () => {
  assert.match(
    createSecurityHeaders('abcdefghijklmnopqrstuvwx', true)[
      'Content-Security-Policy'
    ],
    /unsafe-eval/,
  );
  assert.doesNotMatch(
    createSecurityHeaders('abcdefghijklmnopqrstuvwx')[
      'Content-Security-Policy'
    ],
    /unsafe-eval|vercel-scripts|wss?:/,
  );
});
