const { parseDataset } = require('./src/services/evaluation/datasetParser');
const { normalizeDataset } = require('./src/services/evaluation/normalizer');
const { buildGuideMetricInputs } = require('./src/services/evaluation/inputBuilders');

const mockRows = [{
  "AI response": "Hello AI",
  "expected answer": "Hello expected"
}];

const normalized = normalizeDataset(mockRows);
console.log("Normalized:", normalized);

const guideInputs = buildGuideMetricInputs(normalized);
console.log("Guide Inputs:", guideInputs);
