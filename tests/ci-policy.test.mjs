import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';

test('Vite deployment cannot accidentally create a second platform middleware', async () => {
  for (const directory of ['.', 'src']) {
    const files = await readdir(directory).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    assert(
      !files.some((file) => /^middleware\.(?:[cm]?[jt]s|[jt]sx)$/.test(file)),
      'Use the Vinext proxy.ts convention; middleware.ts is independently deployed by Vercel',
    );
  }
  const deployment = JSON.parse(await readFile('vercel.json', 'utf8'));
  assert.equal(deployment.framework, 'vite');
  assert.equal(
    deployment.proxy,
    undefined,
    'Routing belongs to the bundled Vinext server, not a second platform proxy',
  );
});

test('PR CI stays unprivileged, pinned, and cannot silently skip a required job', async () => {
  const workflow = parse(await readFile('.github/workflows/ci.yml', 'utf8'));
  assert(workflow.on.pull_request);
  assert(workflow.on.push);
  assert('merge_group' in workflow.on);
  assert(!('pull_request_target' in workflow.on));
  assert.equal(workflow.permissions.contents, 'read');
  const expected = Object.keys(workflow.jobs)
    .filter((name) => name !== 'required')
    .sort((a, b) => a.localeCompare(b));
  assert.deepEqual(
    [...workflow.jobs.required.needs].sort((a, b) => a.localeCompare(b)),
    expected,
  );
  assert.match(workflow.jobs.required.if, /always\(\)/);
  for (const [name, job] of Object.entries(workflow.jobs)) {
    assert(job['timeout-minutes'] > 0, `${name} must have a timeout`);
    for (const step of job.steps) {
      if (step.uses) assert.match(step.uses, /^[\w-]+\/[\w/-]+@[a-f0-9]{40}$/);
      if (step.uses?.startsWith('actions/checkout@'))
        assert.equal(step.with['persist-credentials'], false);
      assert(
        !JSON.stringify(step).includes('secrets.VERCEL_TOKEN'),
        'PR checks must not need deployment credentials',
      );
    }
  }
});
