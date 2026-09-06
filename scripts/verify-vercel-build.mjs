import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = resolve('.vercel/output');
const config = JSON.parse(await readFile(join(output, 'config.json'), 'utf8'));
assert.equal(config.version, 3, 'Expected Vercel Build Output API v3');
assert(config.routes.some((route) => route.dest === '/__server'));

// Deployment artifacts must not expose source maps, secrets, or server code.
const publicFiles = await readdir(join(output, 'static'), { recursive: true });
for (const file of publicFiles) {
  assert(
    !/(^|[/\\])(?:\.env(?:\.|$)|\.git(?:[/\\]|$))|\.(?:map|pem|key|sqlite|db)$/.test(
      file,
    ),
    `Private artifact in public output: ${file}`,
  );
  assert(
    !file.endsWith('.ts') && !file.endsWith('.tsx'),
    `Application source exposed: ${file}`,
  );
}

// Run the packaged function outside the checkout so missing runtime dependencies
// cannot accidentally resolve from the development node_modules directory.
const scratch = await mkdtemp(join(tmpdir(), 'rove-vercel-check-'));
try {
  const functionDirectory = join(scratch, '__server.func');
  await cp(join(output, 'functions/__server.func'), functionDirectory, {
    recursive: true,
  });
  const functionConfig = JSON.parse(
    await readFile(join(functionDirectory, '.vc-config.json'), 'utf8'),
  );
  const { default: handler } = await import(
    pathToFileURL(join(functionDirectory, functionConfig.handler)).href
  );
  assert.equal(typeof handler.fetch, 'function');

  const response = await handler.fetch(new Request('https://rove.test/'));
  assert.equal(
    response.status,
    200,
    'Homepage must render from the built function',
  );
  const html = await response.text();
  assert(html.includes('Rove — A better way to get there.'));
  assert(html.includes('hero-demo'), 'Animated hero must be included');

  const assetPaths = new Set(
    [...html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)]
      .map((match) => match[1])
      .filter((path) => /\.(?:css|js|svg|webp|png|jpe?g|woff2?)$/.test(path)),
  );
  assert(assetPaths.size > 0, 'Homepage must reference deployable assets');
  for (const path of assetPaths) {
    assert(
      (await stat(join(output, 'static', path))).isFile(),
      `Missing asset: ${path}`,
    );
  }
  const cssPaths = [...assetPaths].filter((path) => path.endsWith('.css'));
  const styles = (
    await Promise.all(
      cssPaths.map((path) => readFile(join(output, 'static', path), 'utf8')),
    )
  ).join('\n');
  assert(
    styles.includes('demo-plan-scene'),
    'Hero animation styles must be deployed',
  );

  const rsc = await handler.fetch(
    new Request('https://rove.test/?_rsc', {
      headers: { RSC: '1' },
    }),
  );
  assert.equal(rsc.status, 200, 'React Server Component response must render');
  assert.match(rsc.headers.get('content-type') || '', /text\/x-component/);
  await rsc.text();

  const missing = await handler.fetch(
    new Request('https://rove.test/missing-page'),
  );
  assert.equal(missing.status, 404, 'Unknown routes must return 404');
  await missing.text();
  console.log(
    `Vercel bundle verified: HTML, RSC, 404, animation CSS, and ${assetPaths.size} referenced assets.`,
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
