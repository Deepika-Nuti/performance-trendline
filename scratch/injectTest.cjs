const fs = require('fs');
let content = fs.readFileSync('tests/evaluation/batch.test.ts', 'utf8');

const injectCode = `
    console.log('--- ROUGE-1 SCORES FOR HALLUCINATION ROWS ---');
    let min = 1, max = 0;
    data.forEach((row, index) => {
        if (row['Type of issue'] === 'Hallucination') {
            const h = String(row['Generated_Answers']);
            const r = String(row['Expected_Answers']);
            const score = require('../../src/services/metrics/logmark/rouge.js').rougeN(h, r, 1);
            console.log(\`Row \${index + 2}: \${score.toFixed(4)}\`);
            if (score < min) min = score;
            if (score > max) max = score;
        }
    });
    console.log(\`Min: \${min.toFixed(4)}\`);
    console.log(\`Max: \${max.toFixed(4)}\`);
`;

content = content.replace(/const runData = await runEvaluation/, injectCode + '\n    const runData = await runEvaluation');
fs.writeFileSync('tests/evaluation/batch.test.ts', content, 'utf8');
