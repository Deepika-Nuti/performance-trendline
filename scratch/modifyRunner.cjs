const fs = require('fs');
let content = fs.readFileSync('src/services/evaluation/runner.ts', 'utf8');

content = content.replace(
  /details: result\.details/,
  `details: result.details,
      rowBreakdown: (result as any).rowBreakdown`
);

fs.writeFileSync('src/services/evaluation/runner.ts', content, 'utf8');
