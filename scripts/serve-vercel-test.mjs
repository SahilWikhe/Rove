// Loopback-only test adapter for the actual packaged Vercel function and assets.
import { createServer } from 'node:http';
import { readFile, open } from 'node:fs/promises';
import { resolve, sep, extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = resolve('.vercel/output');
const staticRoot = join(output, 'static');
const functionRoot = join(output, 'functions/__server.func');
const config = JSON.parse(
  await readFile(join(functionRoot, '.vc-config.json'), 'utf8'),
);
const { default: handler } = await import(
  pathToFileURL(join(functionRoot, config.handler)).href
);
const types = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
const port = 4173;
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, `http://127.0.0.1:${port}`);
    const file = resolve(staticRoot, `.${decodeURIComponent(url.pathname)}`);
    if (
      file.startsWith(`${staticRoot}${sep}`) &&
      ['GET', 'HEAD'].includes(incoming.method)
    ) {
      const handle = await open(file, 'r').catch(() => null);
      try {
        if (handle && (await handle.stat()).isFile()) {
          const body =
            incoming.method === 'HEAD' ? undefined : await handle.readFile();
          outgoing.writeHead(200, {
            'Content-Type': types[extname(file)] || 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff',
          });
          outgoing.end(body);
          return;
        }
      } finally {
        await handle?.close();
      }
    }
    // Buffer the small test payloads before invoking middleware: rejecting a
    // request may cancel its Web stream before Node's HTTP stream has drained.
    const chunks = [];
    let bodySize = 0;
    for await (const chunk of incoming) {
      bodySize += chunk.length;
      if (bodySize > 65_536) {
        outgoing.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request(url, {
      method: incoming.method,
      headers: incoming.headers,
      ...(!['GET', 'HEAD'].includes(incoming.method) && {
        body: Buffer.concat(chunks),
      }),
    });
    const response = await handler.fetch(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    const body = Buffer.from(await response.arrayBuffer());
    outgoing.end(incoming.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500).end('Test adapter error');
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Packaged Rove test server: http://127.0.0.1:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => server.close(() => process.exit(0)));
