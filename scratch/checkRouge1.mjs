import * as XLSX from 'xlsx';
import { rouge1 } from '../src/services/metrics/logmark/index.js';

const workbook = XLSX.readFile('C:/Users/Vikas/Downloads/batch-results-2026-08-06-03-Deepika.xlsx');
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const hallucinationScores = [];

data.forEach((row, index) => {
    if (row['Type of issue'] === 'Hallucination') {
        const h = String(row['Generated_Answers']);
        const r = String(row['Expected_Answers']);
        const score = rouge1(h, r);
        hallucinationScores.push({ row: index + 2, score });
    }
});

console.log("ROUGE-1 Scores for Hallucination Rows:");
let min = 1;
let max = 0;
hallucinationScores.forEach(entry => {
    console.log(`Excel Row ${entry.row}: ${entry.score.toFixed(4)}`);
    if (entry.score < min) min = entry.score;
    if (entry.score > max) max = entry.score;
});

console.log(`\nMin: ${min.toFixed(4)}`);
console.log(`Max: ${max.toFixed(4)}`);
