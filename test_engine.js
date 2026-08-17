const content = require('fs').readFileSync('tests/evaluation/engine.test.ts', 'utf-8');
const modified = content.replace("expect(result.status).toBe('not_available');", "if (result.status !== 'not_available') console.log('FAILED METRIC:', metricId, result.reason); expect(result.status).toBe('not_available');");
require('fs').writeFileSync('tests/evaluation/engine.test.ts', modified);
