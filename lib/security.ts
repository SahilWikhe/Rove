/** Public response policy. Keep credentials and environment values out of here. */
export function createSecurityHeaders(nonce: string, development = false) {
  if (!/^[A-Za-z0-9+/]{24}$/.test(nonce)) {
    throw new Error('Expected a fresh 144-bit base64 CSP nonce');
  }
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${development ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
    // The animated UI and component primitives use inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
  ].join('; ');
  return {
    'Content-Security-Policy': policy,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=()',
    // HTML with a per-request nonce must never be reused by a shared cache.
    'Cache-Control': 'private, no-store',
  };
}
