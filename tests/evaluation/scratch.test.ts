import { expect, test } from 'vitest';
import { normalizeDataset } from '../../src/services/evaluation/normalizer';
import { evaluateMetric } from '../../src/services/evaluation/adapter';
import { registry } from '../../src/services/evaluation/registry';
import * as XLSX from 'xlsx';

test('evaluateMetric test', () => {
  const workbook = XLSX.readFile('C:/Users/Vikas/Downloads/batch-results-2026-08-06-03-Deepika.xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  const res = normalizeDataset(data);
  const metric = registry.find(m => m.id === 'rouge-1-guide');
  const evaluationContext = { normalizedRows: res };
  const r = evaluateMetric(metric, evaluationContext);
  console.log('Result:', JSON.stringify(r, null, 2));
});
