import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function assertCodeqlClean(report) {
  assert.equal(report.version, '2.1.0', 'Expected a SARIF 2.1.0 report');
  assert(report.runs?.length > 0, 'CodeQL report contains no analysis runs');
  const blocking = [];
  for (const run of report.runs) {
    assert(Array.isArray(run.results), 'CodeQL results are missing');
    assert(
      run.invocations?.every(
        (invocation) => invocation.executionSuccessful !== false,
      ) ?? true,
      'CodeQL reported an unsuccessful analysis',
    );
    for (const result of run.results) {
      const componentIndex = result.rule?.toolComponent?.index;
      const component =
        componentIndex === undefined
          ? run.tool.driver
          : run.tool.extensions?.[componentIndex];
      const rule = component?.rules?.find(
        (candidate) => candidate.id === result.ruleId,
      );
      assert(rule, `Missing rule metadata for ${result.ruleId}`);
      const rawScore = rule.properties?.['security-severity'];
      const score =
        rawScore === undefined ||
        rawScore === null ||
        String(rawScore).trim() === ''
          ? NaN
          : Number(rawScore);
      if (rule.properties?.tags?.includes('security'))
        assert(
          Number.isFinite(score) && score >= 0 && score <= 10,
          `Missing security severity for ${rule.id}`,
        );
      if (score >= 7) blocking.push(`${rule.id} (security severity ${score})`);
    }
  }
  assert.equal(
    blocking.length,
    0,
    `High/critical CodeQL findings:\n${blocking.join('\n')}`,
  );
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const directory = resolve(process.argv[2] || 'codeql-results');
  const reports = (await readdir(directory)).filter((file) =>
    file.endsWith('.sarif'),
  );
  assert(reports.length > 0, 'No CodeQL SARIF reports were produced');
  for (const file of reports)
    assertCodeqlClean(
      JSON.parse(await readFile(join(directory, file), 'utf8')),
    );
  console.log('CodeQL reports contain no high or critical security findings.');
}
