import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = 'C:/Users/Vikas/Downloads/performance-trendline/src/services/metrics/logmark';
const exclude = ['index.js', 'run_all.js', 'smoke-test.js', 'base-test.js', 'datasetEvaluator.js'];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !exclude.includes(f));

for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const exports = [];
    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/^export\s+(function|const)\s+([a-zA-Z0-9_]+)/);
        if (match) {
            exports.push(match[2]);
        }
    }
    console.log(`${file}: ${exports.join(', ')}`);
}
