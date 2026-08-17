import { describe, it, expect } from 'vitest';
import { normalizeDataset } from './src/services/evaluation/normalizer';
import { buildGuideMetricInputs } from './src/services/evaluation/inputBuilders';
import { accuracy, completenessFlag, faithfulness } from './src/services/metrics/logmark/index.ts';
import * as fs from 'fs';

describe('Metric Change Test', () => {
  it('should test if changing AI response changes metric', () => {
    let out = "";
    const expected = "The capital of France is Paris.";
    
    // First upload
    const mockRows1 = [{
      "AI response": "Paris is the capital of France.",
      "expected answer": expected
    }];
    const normalized1 = normalizeDataset(mockRows1);
    const inputs1 = buildGuideMetricInputs(normalized1).inputs[0];
    const acc1 = accuracy(inputs1.h, inputs1.r);
    const comp1 = completenessFlag(inputs1.h, inputs1.r);
    const faith1 = faithfulness(inputs1.h, inputs1.r);
    
    out += "Upload 1 - AI Response: " + inputs1.h + "\n";
    out += "Accuracy: " + acc1 + "\n";
    out += "Completeness: " + comp1 + "\n";
    out += "Faithfulness: " + faith1 + "\n\n";

    // Second upload (changed AI response)
    const mockRows2 = [{
      "AI response": "The capital of France is Paris.", // exact match
      "expected answer": expected
    }];
    const normalized2 = normalizeDataset(mockRows2);
    const inputs2 = buildGuideMetricInputs(normalized2).inputs[0];
    const acc2 = accuracy(inputs2.h, inputs2.r);
    const comp2 = completenessFlag(inputs2.h, inputs2.r);
    const faith2 = faithfulness(inputs2.h, inputs2.r);
    
    out += "Upload 2 - AI Response: " + inputs2.h + "\n";
    out += "Accuracy: " + acc2 + "\n";
    out += "Completeness: " + comp2 + "\n";
    out += "Faithfulness: " + faith2 + "\n\n";

    fs.writeFileSync('test-out2.txt', out);
  });
});
