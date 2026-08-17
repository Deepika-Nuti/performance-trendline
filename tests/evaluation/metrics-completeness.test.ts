import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import { runEvaluation } from '../../src/services/evaluation/runner';
import { registry } from '../../src/services/evaluation/registry';
import { clearRuns } from '../../src/services/storage/evaluationStorage';

describe('Metrics Completeness Regression', () => {
  beforeAll(async () => {
    await clearRuns();
  });

  it('should include all 47 metrics in the evaluation results on every run', async () => {
    const dummyRows = [
      { id: 1, prompt: 'hello', generated_text: 'hi', expected_text: 'hello', 'Type of issue': 'None' }
    ];

    const run1 = await runEvaluation('test1', dummyRows, 'test-model', 'v1');
    const run2 = await runEvaluation('test2', dummyRows, 'test-model', 'v1');

    const expectedKeys = registry.map(m => m.id).sort();
    const run1Keys = Object.keys(run1.metricResults).sort();
    const run2Keys = Object.keys(run2.metricResults).sort();

    expect(run1Keys.length).toBe(47);
    expect(run2Keys.length).toBe(47);
    expect(run1Keys).toEqual(expectedKeys);
    expect(run2Keys).toEqual(expectedKeys);
  });
});
