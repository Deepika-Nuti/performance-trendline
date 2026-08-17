const fs = require('fs');
let content = fs.readFileSync('src/services/evaluation/inputBuilders.ts', 'utf8');

const mappingCode = `
const HALLUCINATION_LABEL_MAPPING: Record<string, boolean> = {
  'Hallucination': true,
  'Biased': false,
  'Inaccurate': false
};
`;

if (!content.includes('HALLUCINATION_LABEL_MAPPING')) {
    content = content.replace(/(export function buildGuideMetricInputs)/, mappingCode + '\n$1');
}

// Modify buildGuideMetricInputs
content = content.replace(
  /for \(const row of normalizedRows\) {[\s\S]*?if \(row\.generated_text !== undefined && row\.reference_text !== undefined\) {[\s\S]*?inputs\.push\({[\s\S]*?h: String\(row\.generated_text\),[\s\S]*?r: String\(row\.reference_text\)[\s\S]*?}\);[\s\S]*?}[\s\S]*?}/,
  `for (const row of normalizedRows) {
    if (row.generated_text !== undefined && row.reference_text !== undefined) {
      const rawIssue = row.raw && row.raw['Type of issue'];
      let humanHallucinationLabel: boolean | null = null;
      if (rawIssue && HALLUCINATION_LABEL_MAPPING.hasOwnProperty(rawIssue)) {
          humanHallucinationLabel = HALLUCINATION_LABEL_MAPPING[rawIssue];
      }
      inputs.push({
        h: String(row.generated_text),
        r: String(row.reference_text),
        humanHallucinationLabel
      });
    }
  }`
);

fs.writeFileSync('src/services/evaluation/inputBuilders.ts', content, 'utf8');
