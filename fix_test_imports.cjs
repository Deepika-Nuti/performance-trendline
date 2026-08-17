const fs = require('fs');

let c = fs.readFileSync('tests/evaluation/engine.test.ts', 'utf8');

c = c.replace(/import \* as runAllMock from '\.\.\/\.\.\/src\/services\/metrics\/logmark\/run_all';/g, '');
c = c.replace(/import \* as guideMetrics from '\.\.\/\.\.\/src\/services\/metrics\/logmark\/guideMetrics';/g, '');
c = c.replace(/import \* as bleu from '\.\.\/\.\.\/src\/services\/metrics\/logmark\/bleu';/g, '');

const newImports = `import { calculateBLEU, rouge1, calculateCompositeBiasIndex } from '../../src/services/metrics/logmark/index.js';\n`;

c = c.replace(/import \{ registry \} from '\.\.\/\.\.\/src\/services\/evaluation\/registry';\n/, "import { registry } from '../../src/services/evaluation/registry';\n" + newImports);

c = c.replace(/bleu\.calculateBLEU/g, 'calculateBLEU');
c = c.replace(/guideMetrics\.rouge1/g, 'rouge1');

fs.writeFileSync('tests/evaluation/engine.test.ts', c);
console.log('Fixed test imports!');
