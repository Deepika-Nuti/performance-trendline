const fs = require('fs');
let content = fs.readFileSync('tests/evaluation/batch.test.ts', 'utf8');

if (!content.includes('fs.writeFileSync')) {
  content = content.replace(
    /console\.log\(JSON\.stringify\(runData\.metricResults, null, 2\)\);/,
    `require('fs').writeFileSync('batch-regression-output.json', JSON.stringify(runData.metricResults, null, 2));`
  );
  fs.writeFileSync('tests/evaluation/batch.test.ts', content, 'utf8');
}
