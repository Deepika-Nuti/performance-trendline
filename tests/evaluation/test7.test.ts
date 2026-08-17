import { describe, it, expect } from 'vitest';
import { normalizeDataset } from './src/services/evaluation/normalizer';
import { buildGuideMetricInputs } from './src/services/evaluation/inputBuilders';
import { accuracy, completenessFlag, faithfulness } from './src/services/metrics/logmark/index.ts';

describe('Metric Change Test', () => {
  it('should test if changing AI response changes metric', () => {
    let out = "";
    const expected = "The capital of France is Paris.";
    
    // First upload
    const mockRows1 = [{
      "AI Response": "Paris is the capital of France.",
      "expected answer": expected
    }];
    const normalized1 = normalizeDataset(mockRows1);
    const inputs1 = buildGuideMetricInputs(normalized1).inputs[0];
    const acc1 = accuracy(inputs1.h, inputs1.r);
    
    console.log("Upload 1 - AI Response: " + inputs1.h);
    console.log("Accuracy: " + acc1);

    // Second upload (changed AI response)
    const mockRows2 = [{
      "AI Response": "The capital of France is Paris.", // exact match
      "expected answer": expected
    }];
    const normalized2 = normalizeDataset(mockRows2);
    const inputs2 = buildGuideMetricInputs(normalized2).inputs[0];
    const acc2 = accuracy(inputs2.h, inputs2.r);
    
    console.log("Upload 2 - AI Response: " + inputs2.h);
    console.log("Accuracy: " + acc2);
  });
});
