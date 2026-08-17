import { describe, it, expect } from 'vitest';
import { buildAggregateOverallInputs } from '../../src/services/evaluation/inputBuilders';

describe('aggregate-overall Input Builder', () => {
  it('should compute 68 for the clean batch example and correctly scale 0-1 metrics to percentages', () => {
    const mockContext = {
      metricResults: {
        'accuracy': { status: 'calculated', value: 54.650128901171214 },
        'completeness-flag': { status: 'calculated', value: 0.8666666666666667 },
        'hallucination-flag': { status: 'calculated', value: 0.3333333333333333 },
        'faithfulness': { status: 'calculated', value: 0.665672224097478 }
      }
    };
    const result = buildAggregateOverallInputs([], mockContext);
    expect(result.status).toBe('available');
    
    // The implementation Math.round(...) logic
    const { accuracyMean, completenessPct, hallucinationPct, faithfulnessMean } = result.inputs as any;
    const finalScore = Math.round(
      0.35 * accuracyMean +
      0.30 * completenessPct +
      0.20 * (100 - hallucinationPct) +
      0.15 * faithfulnessMean
    );

    expect(finalScore).toBe(68);
  });

  it('should return not_available if a required dependency is not_available', () => {
    const mockContext = {
      metricResults: {
        'accuracy': { status: 'calculated', value: 54.65 },
        'completeness-flag': { status: 'calculated', value: 0.86 },
        'hallucination-flag': { status: 'not_available', reason: 'Missing labels' },
        'faithfulness': { status: 'calculated', value: 0.66 }
      }
    };
    const result = buildAggregateOverallInputs([], mockContext);
    expect(result.status).toBe('not_available');
    expect(result.reason).toContain('Requires hallucination-flag, which was not available');
  });

  it('should throw if a required dependency has not run yet (is undefined)', () => {
    const mockContext = {
      metricResults: {
        'accuracy': { status: 'calculated', value: 54.65 },
        'completeness-flag': { status: 'calculated', value: 0.86 },
        'faithfulness': { status: 'calculated', value: 0.66 }
        // hallucination-flag is undefined
      }
    };
    expect(() => buildAggregateOverallInputs([], mockContext)).toThrowError('Dependency hallucination-flag has not run yet. Registry ordering error.');
  });
});
