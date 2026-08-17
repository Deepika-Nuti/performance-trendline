import { describe, it, expect } from 'vitest';
import { normalizeDataset } from './src/services/evaluation/normalizer';
import { buildGuideMetricInputs } from './src/services/evaluation/inputBuilders';
import { normalizeFieldName } from './src/services/metrics/fieldNormalizer';
import * as fs from 'fs';

describe('Normalizer Test', () => {
  it('should test mapping of AI response', () => {
    let out = "";
    out += "normalizeFieldName AI response: " + normalizeFieldName("AI response") + "\n";
    out += "normalizeFieldName expected answer: " + normalizeFieldName("expected answer") + "\n";

    const mockRows = [{
      "AI response": "Hello AI",
      "expected answer": "Hello expected"
    }];

    const normalized = normalizeDataset(mockRows);
    out += "Normalized row 0: " + JSON.stringify(normalized[0], null, 2) + "\n";

    const guideInputs = buildGuideMetricInputs(normalized);
    out += "Guide Inputs: " + JSON.stringify(guideInputs, null, 2) + "\n";
    fs.writeFileSync('test-out.txt', out);
  });
});
