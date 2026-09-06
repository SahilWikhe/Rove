import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCodeqlClean } from '../scripts/check-codeql.mjs';

function report(score, results = [{ ruleId: 'js/example', level: 'warning' }]) {
  return {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            rules: [
              {
                id: 'js/example',
                properties: { 'security-severity': score, tags: ['security'] },
              },
            ],
          },
        },
        invocations: [{ executionSuccessful: true }],
        results,
      },
    ],
  };
}

test('clean scans and findings below high severity pass the CodeQL gate', () => {
  assert.doesNotThrow(() => assertCodeqlClean(report('9.8', [])));
  assert.doesNotThrow(() => assertCodeqlClean(report('6.9')));
});

test('high and critical security scores fail even when SARIF level is warning', () => {
  for (const score of ['7.0', '8.1', '9.8']) {
    assert.throws(() => assertCodeqlClean(report(score)), /High\/critical/);
    // Current CodeQL stores query-pack rules in SARIF tool extensions.
    const extended = report(score);
    const run = extended.runs[0];
    run.tool.extensions = [
      { name: 'codeql/javascript-queries', rules: run.tool.driver.rules },
    ];
    delete run.tool.driver.rules;
    run.results[0].rule = { toolComponent: { index: 0 } };
    assert.throws(() => assertCodeqlClean(extended), /High\/critical/);
  }
});

test('absent results and failed analysis cannot produce a green security gate', () => {
  assert.throws(() => assertCodeqlClean({ version: '2.1.0', runs: [] }));
  const failed = report('5');
  failed.runs[0].invocations[0].executionSuccessful = false;
  assert.throws(() => assertCodeqlClean(failed), /unsuccessful/);
  delete failed.runs[0].results;
  assert.throws(() => assertCodeqlClean(failed), /results are missing/);
});

test('findings with missing rule metadata or security scores fail closed', () => {
  for (const score of [undefined, null, '', ' ', 'invalid', '-1', '11'])
    assert.throws(
      () => assertCodeqlClean(report(score)),
      /Missing security severity/,
    );
  assert.throws(
    () => assertCodeqlClean(report('7', [{ ruleId: 'unknown' }])),
    /Missing rule metadata/,
  );
});
