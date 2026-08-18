const fs = require('fs');
const Papa = require('papaparse');
const { runEvaluation } = require('./src/services/evaluation/runner');

async function main() {
  const csvContent = fs.readFileSync('C:/Users/Deepika/Downloads/batch-results-2026-08-17.csv', 'utf8');
  const { data } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  
  // mock DB
  global.indexedDB = require('fake-indexeddb');
  
  const runResult = await runEvaluation('spec-dataset', data, 'Llama-3-8B-Instruct', 'v1.2.0');
  
  console.log('Bias Index:', runResult.metricResults['bias-index']);
  console.log('Provenance Completeness:', runResult.metricResults['provenance-completeness']);
  console.log('Privacy Integrity:', runResult.metricResults['privacy-integrity']);
  console.log('Bias Mitigation:', runResult.metricResults['bias-mitigation']);
}

main().catch(console.error);
