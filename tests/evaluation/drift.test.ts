import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { runEvaluation } from '../../src/services/evaluation/runner';
import { clearRuns } from '../../src/services/storage/evaluationStorage';

describe('Drift Metrics Phase 11', () => {
  beforeEach(async () => {
    await clearRuns();
  });

  const baselineRows = [
    { question: 'Q1', generated_text: 'R1', reference_text: 'R1', 'Type of issue': 'Hallucination', score_numeric: 5 },
    { question: 'Q2', generated_text: 'R2', reference_text: 'R2', 'Type of issue': 'Hallucination', score_numeric: 4 },
    { question: 'Q3', generated_text: 'R3', reference_text: 'R3', 'Type of issue': 'Inaccurate', score_numeric: 1 },
    { question: 'Q4', generated_text: 'R4', reference_text: 'R4', 'Type of issue': 'Biased', score_numeric: 8 }
  ];

  const currentRows = [
    { question: 'Q1', generated_text: 'A1 bad', reference_text: 'R1', 'Type of issue': 'Hallucination', score_numeric: 2 },
    { question: 'Q2', generated_text: 'A2 bad', reference_text: 'R2', 'Type of issue': 'Biased', score_numeric: 3 },
    { question: 'Q3', generated_text: 'A3', reference_text: 'R3', 'Type of issue': 'Biased', score_numeric: 3 },
    { question: 'Q4', generated_text: 'A4', reference_text: 'R4', 'Type of issue': 'Biased', score_numeric: 3 }
  ];

  it('No Baseline -> Graceful not_available fallback', async () => {
    const run = await runEvaluation('dataset', currentRows, 'ModelA', '1.0');
    expect(run.metricResults['data-drift'].status).toBe('not_available');
    expect(run.metricResults['custom-drift'].status).toBe('not_available');
    expect(run.metricResults['model-drift'].status).toBe('not_available');
  });

  it('Calculates Data Drift, Model Drift, and Custom Drift successfully when baseline exists', async () => {
    await runEvaluation('dataset', baselineRows, 'ModelA', '1.0');
    const run = await runEvaluation('dataset2', currentRows, 'ModelA', '1.0');
    
    // Model Drift
    const md = run.metricResults['model-drift'];
    expect(md.status).toBe('calculated');
    expect(md.value).toBe(0);
    expect(md.details).toBeDefined();

    // Custom Drift
    const cd = run.metricResults['custom-drift'];
    expect(cd.status).toBe('calculated');
    expect(typeof cd.value).toBe('number');
    expect(cd.details?.classification).toBeDefined();

    // Data Drift
    const dd = run.metricResults['data-drift'];
    expect(dd.status).toBe('calculated');
    expect(typeof dd.value).toBe('number');
  });

  it('Data Drift -> No comparable features -> not_available', async () => {
    await runEvaluation('dataset', baselineRows, 'ModelA', '1.0');
    const badRows = currentRows.map(r => { const r2 = {...r}; delete (r2 as any).score_numeric; return r2; });
    const run = await runEvaluation('dataset2', badRows as any, 'ModelA', '1.0');
    
    expect(run.metricResults['data-drift'].status).toBe('not_available');
    expect(run.metricResults['data-drift'].reason).toContain('checked features');
  });
});
