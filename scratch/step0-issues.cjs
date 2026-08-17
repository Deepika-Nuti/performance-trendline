const XLSX = require('xlsx');

const workbook = XLSX.readFile('C:/Users/Vikas/Downloads/batch-results-2026-08-06-03-Deepika.xlsx');
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const issues = data.map(row => row['Type of issue']);
const issueCounts = {};

issues.forEach(issue => {
    const key = issue === undefined ? 'UNDEFINED' : (issue === null ? 'NULL' : String(issue));
    issueCounts[key] = (issueCounts[key] || 0) + 1;
});

console.log("Distinct 'Type of issue' values:");
for (const [key, count] of Object.entries(issueCounts)) {
    console.log(`- "${key}": ${count}`);
}
