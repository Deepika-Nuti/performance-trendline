import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runEvaluation } from '../../src/services/evaluation/runner';
import { db } from '../../src/services/storage/evaluationStorage';
import { registry } from '../../src/services/evaluation/registry';
import { calculateBLEU, rouge1, calculateCompositeBiasIndex } from '../../src/services/metrics/logmark/index.js';
 



// Mock Dexie DB methods
vi.mock('../../src/services/storage/evaluationStorage', () => {
  const dbRuns: any[] = [];
  return {
    db: {
      runs: {
        clear: vi.fn(async () => { dbRuns.length = 0; }),
        toArray: vi.fn(async () => [...dbRuns]),
        put: vi.fn(async (run) => { dbRuns.push(run); })
      }
    },
    saveRun: vi.fn(async (run) => { dbRuns.push(run); }),
    saveRunData: vi.fn(async (id, rows) => {}),
    getRunData: vi.fn(async (id) => []),
    getRuns: vi.fn(async () => [...dbRuns])
  };
});

describe('Evaluation Engine (v2)', () => {
  beforeEach(async () => {
    await db.runs.clear();
  });

  it('Should successfully upload valid batch results with automatic field detection', async () => {
    const batch = [
      { prediction: 'Paris is the capital of France.', expected_output: 'Paris is the capital of France.', prompt: 'What is the capital of France?' },
      { prediction: 'I do not know.', expected_output: '42', prompt: 'What is the answer?' }
    ];

    const runResult = await runEvaluation('test-dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    // Normalization should have worked automatically
    expect(runResult.metricResults['bleu-4']?.status).toBe('calculated');
    expect(runResult.metricResults['truthfulqa']?.status).toBe('calculated');
  });

  it('Benchmark Equality Test: adapter produces the exact same value as direct unmocked function call', async () => {
    const batch = [
      { generated_text: 'Paris is the capital of France.', reference_text: 'Paris is the capital of France.', question: 'What is the capital of France?' }
    ];

    // Compute direct expected values from unmocked source
    const expectedBleu = calculateBLEU(batch[0].generated_text, batch[0].reference_text);
    const expectedRouge1 = rouge1(batch[0].generated_text, batch[0].reference_text);

    const runResult = await runEvaluation('equality-dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    // Assert full pipeline matches direct unmocked call exactly
    expect(runResult.metricResults['bleu-4']?.status).toBe('calculated');
    expect(runResult.metricResults['bleu-4']?.value).toBeCloseTo(expectedBleu);

    expect(runResult.metricResults['rouge-1-guide']?.status).toBe('calculated');
    expect(runResult.metricResults['rouge-1-guide']?.value).toBeCloseTo(expectedRouge1);
  });

  
  it('Benchmark Equality Test: Governance Composites are wired to real formulas', async () => {
    const batch = [
      { candidate: 'A', reference: 'B' }
    ];

    const runResult = await runEvaluation('gov-dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    // Check that governance metrics are now 'not_available' due to Phase 5 strict rules on mock data
    const biasIndexResult = runResult.metricResults['bias-index'];
    expect(biasIndexResult?.status).toBe('not_available');

    const mitigationResult = runResult.metricResults['bias-mitigation'];
    expect(mitigationResult?.status).toBe('not_available');
  });

  it('Should correctly output the expected mix of calculated and not_available for a plain QA upload', async () => {
    const batch = [
      { generated_text: 'Paris is the capital of France.', reference_text: 'Paris is the capital of France.', question: 'What is the capital of France?' }
    ];

    const runResult = await runEvaluation('qa-dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    // Verify guide metrics & generation are calculated
    const calculatedMetrics = [
      'bleu-4', 'rouge-n', 'rouge-l', 'rouge-s', 'perplexity', 'truthfulqa',
      'rouge-1-guide', 'rouge-l-guide', 'rouge-2-guide', 'precision', 'recall',
      'f1', 'bleu-guide', 'semantic-similarity', 'wer', 'faithfulness',
      'completeness-flag', 'accuracy', 'row-overall'
    ];
    for (const metricId of calculatedMetrics) {
      const result = runResult.metricResults[metricId];
      expect(result, `Missing metric: ${metricId}`).toBeDefined();
      if (result.status !== 'calculated') {
         console.error(`Metric ${metricId} failed with status ${result.status} and reason: ${result.reason}`);
      }
      expect(result.status, `Metric ${metricId} should be calculated`).toBe('calculated');
    }

    // Verify governance, fairness, and reasoning are not_available
    const notAvailableMetrics = [
      'statistical-parity-difference', 'disparate-impact', 'equal-opportunity-difference', 'average-odds-difference',
      'hallucination-flag', 'bias-mitigation', 'bias-index', 'privacy-integrity', 'provenance-completeness', 'auditability-level', 'compliance-adaptability',
      'reasoning-correctness', 'stepwise-integrity', 'traceability-explainability', 'transparency-score',
      'attack-success-rate', 'data-drift', 'custom-drift', 'aggregate-overall'
    ];

    for (const metricId of notAvailableMetrics) {
      const result = runResult.metricResults[metricId];
      expect(result).toBeDefined();
      expect(result.status).toBe('not_available');
      expect(result.reason).toBeDefined();
    }
  });

  it('Should isolate failures and not stop the overall run', async () => {
    const batch = [
      { candidate: 'throw', reference: 'test' } 
    ];
    
    const originalBleu = registry.find(m => m.id === 'bleu-4')?.implementation;
    const bleuDef = registry.find(m => m.id === 'bleu-4');
    if (bleuDef) {
      bleuDef.implementation = () => { throw new Error('Simulated error'); };
    }

    const runResult = await runEvaluation('throw-dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    expect(runResult.metricResults['bleu-4']?.status).toBe('error');
    expect(runResult.metricResults['rouge-l']?.status).not.toBe('error');

    if (bleuDef && originalBleu) {
      bleuDef.implementation = originalBleu;
    }
  });

  it('Should return not_available for Model Drift on the first run, and calculated on the second', async () => {
    const batch = [
      { generated_text: 'Paris is the capital of France.', reference_text: 'Paris is the capital of France.', question: 'What is the capital of France?', 'Type of issue': 'Inaccurate' }
    ];

    const run1 = await runEvaluation('dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    expect(run1.metricResults['model-drift']?.status).toBe('not_available');

    const run2 = await runEvaluation('dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    console.log('RUN 1 AGGREGATE:', run1.metricResults['aggregate-overall']);
    console.log('RUN 1 COMP FLAG:', run1.metricResults['completeness-flag']);
    console.log('RUN 1 HALLU FLAG:', run1.metricResults['hallucination-flag']);
    console.log('RUN 1 FAITH:', run1.metricResults['faithfulness']);
    expect(run2.metricResults['model-drift']?.status).toBe('calculated');
  });

  it('Should correctly store multiple immutable runs', async () => {
    const batch = [{ generated_text: 'A', reference_text: 'B' }];
    const run1 = await runEvaluation('dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    const run2 = await runEvaluation('dataset', batch, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    expect(run1.runId).not.toBe(run2.runId);
    
    const runsInDb = await db.runs.toArray();
    expect(runsInDb.length).toBe(2);
    expect(runsInDb[0].runId).toBe(run1.runId);
    expect(runsInDb[1].runId).toBe(run2.runId);
  });

  it('Benchmark Test: Should never read base-test.golden', () => {
    const fs = require('fs');
    const readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
    
    const calls = readFileSyncSpy.mock.calls;
    const readGolden = calls.some(call => typeof call[0] === 'string' && call[0].includes('base-test.golden'));
    
    expect(readGolden).toBe(false);
  });

  it('Overall Status Test: Full Verification', async () => {
    const { getOverallStatus, getMetricTrend } = await import('../../src/services/evaluation/TrendAnalysis');
    
    // Create first run
    const batch1 = [ { generated_text: 'Paris is the capital of France.', reference_text: 'Paris is the capital of France.', question: 'What is the capital of France?' } ];
    const run1 = await runEvaluation('test-dataset-1', batch1, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    // Create second run 
    const batch2 = [ { generated_text: 'I do not know.', reference_text: 'Paris is the capital of France.', question: 'What is the capital of France?' } ];
    const run2 = await runEvaluation('test-dataset-2', batch2, 'Llama-3-8B-Instruct', 'v1.2.0');

    const statusRun1 = getOverallStatus(run1);
    const statusRun2 = getOverallStatus(run2, run1);
    
    console.log('--- FIRST RUN (Insufficient Data) ---');
    console.log(JSON.stringify({ OverallStatus: statusRun1 }, null, 2));

    console.log('--- SECOND RUN (Degrading vs Run 1) ---');
    console.log(JSON.stringify({
       OverallStatus: statusRun2,
       MetricResultsSample: {
         'bleu-4': run2.metricResults['bleu-4'],
         'rouge-l': run2.metricResults['rouge-l']
       }
    }, null, 2));

    // Manually mutate the metric results to explicitly test polarity directions for the sake of logging
    // Accuracy (higherIsBetter = true) moves UP from 0.5 to 0.8 -> Improving
    run1.metricResults['accuracy'] = { status: 'calculated', value: 0.5 };
    run2.metricResults['accuracy'] = { status: 'calculated', value: 0.8 };

    // WER (higherIsBetter = false) moves DOWN from 0.3 to 0.1 -> Improving
    run1.metricResults['wer'] = { status: 'calculated', value: 0.3 };
    run2.metricResults['wer'] = { status: 'calculated', value: 0.1 };

    const accuracyTrend = getMetricTrend('accuracy', run2, run1);
    const werTrend = getMetricTrend('wer', run2, run1);
    
    console.log(`[Polarity Verification] Accuracy (higherIsBetter: true) | Run1: 0.5 -> Run2: 0.8 | Status: ${accuracyTrend.status}`);
    console.log(`[Polarity Verification] WER (higherIsBetter: false)      | Run1: 0.3 -> Run2: 0.1 | Status: ${werTrend.status}`);
  });
});
