import { describe, it, expect } from 'vitest';
import { hallucinationFlag } from '../../src/services/metrics/logmark/index';
import { buildGuideMetricInputs } from '../../src/services/evaluation/inputBuilders';
import { evaluateMetric } from '../../src/services/evaluation/adapter';
import * as XLSX from 'xlsx';
import { normalizeDataset } from '../../src/services/evaluation/normalizer';
import { registry } from '../../src/services/evaluation/registry';

describe('Hallucination Override Tests', () => {
  it('Row with Type of issue = "Hallucination" -> flag true (value: 1)', () => {
    const rows = [{ raw: { 'Type of issue': 'Hallucination' }, generated_text: 'foo', reference_text: 'bar' }];
    const buildResult = buildGuideMetricInputs(rows);
    expect(buildResult.status).toBe('available');
    expect(buildResult.inputs[0].humanHallucinationLabel).toBe(true);
    
    const val = hallucinationFlag('foo', 'bar', buildResult.inputs[0].humanHallucinationLabel);
    expect(val.value).toBe(1);
    expect(val.details).toBeDefined();
  });

  it('Row with Type of issue = "Biased" -> flag false (value: 0)', () => {
    const rows = [{ raw: { 'Type of issue': 'Biased' }, generated_text: 'foo', reference_text: 'bar' }];
    const buildResult = buildGuideMetricInputs(rows);
    expect(buildResult.inputs[0].humanHallucinationLabel).toBe(false);

    const val = hallucinationFlag('foo', 'bar', buildResult.inputs[0].humanHallucinationLabel);
    expect(val.value).toBe(0);
  });

  it('Row with blank/null Type of issue -> metric result is not_available', () => {
    const rows = [{ raw: { 'Type of issue': null }, generated_text: 'foo', reference_text: 'bar' }];
    const buildResult = buildGuideMetricInputs(rows);
    expect(buildResult.inputs[0].humanHallucinationLabel).toBeNull();

    const val = hallucinationFlag('foo', 'bar', buildResult.inputs[0].humanHallucinationLabel);
    expect(val.status).toBe('not_available');
  });

  it('Row with an unrecognized/typod label value -> not_available with reason', () => {
    const rows = [{ raw: { 'Type of issue': 'Halucination' }, generated_text: 'foo', reference_text: 'bar' }];
    const buildResult = buildGuideMetricInputs(rows);
    expect(buildResult.inputs[0].humanHallucinationLabel).toBeNull();

    const val = hallucinationFlag('foo', 'bar', buildResult.inputs[0].humanHallucinationLabel);
    expect(val.status).toBe('not_available');
    expect(val.reason).toBe('no human label for this row');
  });

  it('Plain-number return path through adapter is byte-for-byte unchanged', () => {
    const metricDef = {
      id: 'dummy-metric',
      name: 'Dummy',
      type: 'row-level',
      inputBuilder: (rows: any) => ({ status: 'available', inputs: rows.map((r: any) => ({ h: r.h, r: r.r })) }),
      implementation: (h: any, r: any) => 42 // returns a bare number
    };

    const ctx = {
      normalizedRows: [{ h: 'a', r: 'a' }, { h: 'b', r: 'b' }]
    };

    const result = evaluateMetric(metricDef, ctx);
    expect(result.status).toBe('calculated');
    expect(result.value).toBe(42);
    expect(result.details).toBeUndefined();
  });

  it('Regression test against the Deepika batch', () => {
    const workbook = XLSX.readFile('C:/Users/Vikas/Downloads/batch-results-2026-08-06-03-Deepika.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const normalizedRows = normalizeDataset(data);

    const hallMetric = registry.find(m => m.id === 'hallucination-flag');
    const result = evaluateMetric(hallMetric, { normalizedRows });

    // 10 out of 30 should be true -> 0.3333333333333333
    expect(result.status).toBe('calculated');
    expect(result.value).toBeCloseTo(0.333333, 4);
    expect(result.details.heuristicFlag).toBeDefined();
  });
});
