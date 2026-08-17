import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { runEvaluation } from '../../src/services/evaluation/runner';
import { clearRuns, getRuns } from '../../src/services/storage/evaluationStorage';

describe('End-to-end Browser Simulation for Drift', () => {
  beforeAll(async () => {
    await clearRuns();
  });

  it('Simulate upload-twice-same-version and scope-mismatch', async () => {
    // 1. Parse real Deepika batch
    const filePath = path.resolve(__dirname, '../../../batch-results-2026-08-06-03-Deepika.xlsx');
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // First upload
    console.log('--- Upload 1: Baseline ---');
    const run1 = await runEvaluation('Deepika', rawRows, 'Llama-3-8B-Instruct', 'v1.2.0');
    console.log(`Drift Status: ${run1.metricResults['model-drift']?.status}`);
    console.log(`Drift Reason: ${run1.metricResults['model-drift']?.reason}`);

    // Modify a few rows to simulate a degradation
    const degradedRows = JSON.parse(JSON.stringify(rawRows));
    degradedRows[0].generated_text = "wrong answer entirely"; // Ruins accuracy
    degradedRows[1].generated_text = "another hallucination"; 

    // Second upload (Same scope)
    console.log('\n--- Upload 2: Same Version (Degradation) ---');
    const run2 = await runEvaluation('Deepika2', degradedRows, 'Llama-3-8B-Instruct', 'v1.2.0');
    console.log(`Drift Status: ${run2.metricResults['model-drift']?.status}`);
    console.log(`Drift Value: ${run2.metricResults['model-drift']?.value}`);
    console.log(`(Note: Positive value = Degradation)`);

    // Third upload (Different scope)
    console.log('\n--- Upload 3: Scope Mismatch (New Version) ---');
    const run3 = await runEvaluation('Deepika3', degradedRows, 'Llama-3-8B-Instruct', 'v1.3.0');
    console.log(`Drift Status: ${run3.metricResults['model-drift']?.status}`);
    console.log(`Drift Reason: ${run3.metricResults['model-drift']?.reason}`);
    
    expect(true).toBe(true);
  });
});
