const fs = require('fs');
let content = fs.readFileSync('tests/evaluation/batch.test.ts', 'utf8');
content = content.replace(
  /fs\.writeFileSync\('batch-output\.txt', output\);/,
  `fs.writeFileSync('batch-output.txt', output);
    fs.writeFileSync('batch-regression.json', JSON.stringify(runData.metricResults, null, 2));`
);
fs.writeFileSync('tests/evaluation/batch.test.ts', content, 'utf8');
