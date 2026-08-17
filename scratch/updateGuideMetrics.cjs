const fs = require('fs');
let content = fs.readFileSync('src/services/metrics/logmark/guideMetrics.js', 'utf8');

// Replace hallucinationFlag implementation
content = content.replace(
  /function hallucinationFlag\(h, r, manual\) {[\s\S]*?return rouge1\(h, r\) < 0\.15 \? 1 : 0;\s*}/,
  `function hallucinationFlag(h, r, manual) {
  const heuristicFlag = rouge1(h, r) < 0.15 ? 1 : 0;
  if (manual === null || manual === undefined) {
    return { status: 'not_available', reason: 'no human label for this row' };
  }
  return { 
    value: manual ? 1 : 0, 
    details: { heuristicFlag } 
  };
}`
);

fs.writeFileSync('src/services/metrics/logmark/guideMetrics.js', content, 'utf8');
