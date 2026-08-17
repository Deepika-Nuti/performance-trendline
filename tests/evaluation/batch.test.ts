import { describe, it } from 'vitest';
import 'fake-indexeddb/auto';
import * as XLSX from 'xlsx';
import { runEvaluation } from '../../src/services/evaluation/runner';
import { registry } from '../../src/services/evaluation/registry';
import * as fs from 'fs';

describe('Batch Evaluation Runner', () => {
  it('should run full registry against batch-results-2026-08-06-03-Deepika.xlsx', async () => {
    const workbook = XLSX.readFile('C:/Users/Vikas/Downloads/batch-results-2026-08-06-03-Deepika.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    
    console.log('--- ROUGE-1 SCORES FOR HALLUCINATION ROWS ---');
    let min = 1, max = 0;
    data.forEach((row, index) => {
        if (row['Type of issue'] === 'Hallucination') {
            const h = String(row['Generated_Answers']);
            const r = String(row['Expected_Answers']);
            const score = require('../../src/services/metrics/logmark/guideMetrics.js').rouge1(h, r);
            console.log(`Row ${index + 2}: ${score.toFixed(4)}`);
            if (score < min) min = score;
            if (score > max) max = score;
        }
    });
    console.log(`Min: ${min.toFixed(4)}`);
    console.log(`Max: ${max.toFixed(4)}`);

    const runData = await runEvaluation('batch-results-2026-08-06-03-Deepika.xlsx', data);

    let output = '\n======================================================\n';
    output += 'BATCH EVALUATION RESULTS\n';
    output += '======================================================\n\n';

    output += 'Total Rows Processed: ' + runData.sampleCount + '\n';
    output += '\n--- METRICS REGISTRY (39) ---\n';
    
    let calculatedCount = 0;
    let notAvailableCount = 0;
    let errorCount = 0;

    for (const metric of registry) {
      const res = runData.metricResults[metric.id];
      if (!res) {
        output += '[ ] ' + metric.name.padEnd(35) + ' -> MISSING FROM RESULTS\n';
        continue;
      }
      if (res.status === 'calculated') {
        calculatedCount++;
        const valStr = typeof res.value === 'number' ? res.value.toFixed(4) : res.value;
        output += '[✓] ' + metric.name.padEnd(35) + ' -> ' + valStr + '\n';
      } else if (res.status === 'not_available') {
        notAvailableCount++;
        output += '[-] ' + metric.name.padEnd(35) + ' -> skipped (' + res.reason + ')\n';
      } else {
        errorCount++;
        output += '[x] ' + metric.name.padEnd(35) + ' -> ERROR (' + res.reason + ')\n';
      }
    }

    output += '\n--- SUMMARY ---\n';
    output += 'Calculated:    ' + calculatedCount + '\n';
    output += 'Not Available: ' + notAvailableCount + '\n';
    output += 'Errors:        ' + errorCount + '\n';
    output += 'Total Metrics: ' + registry.length + '\n';
    output += '======================================================\n';

    fs.writeFileSync('batch-output.txt', output);
    fs.writeFileSync('batch-regression.json', JSON.stringify(runData.metricResults, null, 2));
  });
});
