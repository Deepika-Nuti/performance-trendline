const fs = require('fs');
let content = fs.readFileSync('src/services/evaluation/adapter.ts', 'utf8');

content = content.replace(
  /let sum = 0;\s*let count = 0;\s*let sumDetails: any = null;/,
  `let sum = 0;
      let count = 0;
      let sumDetails: any = null;
      let rowBreakdown: any[] = [];`
);

content = content.replace(
  /if \(isAvailable && valValue !== undefined\) {/,
  `if (isAvailable && valValue !== undefined) {
          if (metricDefinition.id === 'hallucination-flag') {
              rowBreakdown.push({
                  humanLabel: valValue,
                  heuristic: valDetails ? valDetails.heuristicFlag : null
              });
          }`
);

content = content.replace(
  /if \(sumDetails\) {[\s\S]*?result\.details\[key\] = sumDetails\[key\] \/ count;\s*}[\s\S]*?}/,
  `if (sumDetails) {
          result.details = {};
          for (const key of Object.keys(sumDetails)) {
            result.details[key] = sumDetails[key] / count;
          }
        }
        if (metricDefinition.id === 'hallucination-flag') {
            result.rowBreakdown = rowBreakdown;
        }`
);

fs.writeFileSync('src/services/evaluation/adapter.ts', content, 'utf8');
