import { NextResponse, type NextRequest } from 'next/server';
import { createSecurityHeaders } from './lib/security';

// Vinext bundles this proxy into its server. A root middleware.ts would also
// be auto-deployed by Vercel's Vite builder as a separate routing middleware.
export function proxy(request: NextRequest) {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const nonce = btoa(String.fromCharCode(...bytes));
  const headers = createSecurityHeaders(
    nonce,
    process.env.NODE_ENV !== 'production',
  );

  // Rove is a presentation site: it has no forms, APIs, or Server Actions.
  // Reject writes before the framework attempts to decode an action payload.
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new NextResponse('Method not allowed', {
      status: 405,
      headers: { ...headers, Allow: 'GET, HEAD' },
    });
  }

  const requestHeaders = new Headers(request.headers);
  // Override, rather than trust, any CSP supplied by a client. Vinext reads
  // this request header to nonce its own bootstrap and streaming scripts.
  requestHeaders.set(
    'Content-Security-Policy',
    headers['Content-Security-Policy'],
  );
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [key, value] of Object.entries(headers))
    response.headers.set(key, value);
  return response;
}

export const config = {
  // Vercel owns analytics intake; those POSTs must never be rejected here.
  matcher: ['/((?!_next/static/|_vercel/insights/).*)'],
};
