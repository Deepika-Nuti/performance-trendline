import 'fake-indexeddb/auto';
import { describe, it } from 'vitest';
import * as fs from 'fs';
import Papa from 'papaparse';
import { runEvaluation } from '../../src/services/evaluation/runner';

describe('Investigation Spec', () => {
  it('should evaluate the 4 metrics', async () => {
    const csvContent = fs.readFileSync('C:/Users/Deepika/Downloads/batch-results-2026-08-17.csv', 'utf8');
    const { data } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    
    const runResult = await runEvaluation('spec-dataset', data, 'Llama-3-8B-Instruct', 'v1.2.0');
    
    console.log('Bias Index:', runResult.metricResults['bias-index']);
    console.log('Provenance Completeness:', runResult.metricResults['provenance-completeness']);
    console.log('Privacy Integrity:', runResult.metricResults['privacy-integrity']);
    console.log('Bias Mitigation:', runResult.metricResults['bias-mitigation']);
  });
});
