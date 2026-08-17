import { MetricResult } from '../../types/evaluation';

// Import all metric functions from the source of truth
import { calculateAttackSuccessRate } from './logmark/attackSuccessRate';
import { calculateCompositeAuditability } from './logmark/auditabilityLevel';
import { calculateAOD } from './logmark/averageOddsDifference';
import { calculateCompositeBiasIndex } from './logmark/biasIndex';
import { calculateUtilityWeightedEfficacy } from './logmark/biasMitigation';
import { calculateBLEU } from './logmark/index.js';
import { calculateCompositeComplianceAdaptability } from './logmark/complianceAdaptability';
import { calculateCustomDrift } from './logmark/customDrift';
import { calculateDataDrift } from './logmark/dataDrift';
import { calculateDI } from './logmark/disparateImpact';
import { calculateEOD } from './logmark/equalOpportunityDifference';
import { calculateModelDrift } from './logmark/modelDrift';
import { calculatePerplexity } from './logmark/perplexity';
import { calculateCompositePrivacyIntegrity } from './logmark/privacyIntegrity';
import { calculateProvenanceCompletenessScore } from './logmark/provenanceCompleteness';
import { calculateRC } from './logmark/reasoningCorrectness';
import { rougeN, rougeL, rougeS } from './logmark/rouge';
import { calculateSPD } from './logmark/statisticalParityDifference';
import { calculateSI } from './logmark/stepwiseIntegrity';
import { calculateTE } from './logmark/traceabilityExplainability';
import { calculateTS } from './logmark/transparencyScore';
import { calculateTruthfulQA } from './logmark/truthfulQA';

/**
 * Adapter that proxies resolved canonical inputs to the real metric functions.
 * Wraps every call in isolated error handling so one metric's failure cannot abort the run.
 */
export function calculateMetric(metricId: string, inputs: Record<string, any>): MetricResult {
  try {
    let resultValue: number;

    switch (metricId) {
      case 'attackSuccessRate':
        resultValue = calculateAttackSuccessRate(inputs.successfulAttacks, inputs.totalAttackAttempts);
        break;
      case 'auditabilityLevel':
        resultValue = calculateCompositeAuditability({
          logFieldCompleteness: inputs.logFieldCompleteness,
          ledgerIntegrity: inputs.ledgerIntegrity,
          replayEquivalence: inputs.replayEquivalence,
          w1: inputs.w1,
          w2: inputs.w2,
          w3: inputs.w3
        });
        break;
      case 'averageOddsDifference':
        resultValue = calculateAOD(
          inputs.uTP, inputs.uFP, inputs.uTN, inputs.uFN,
          inputs.pTP, inputs.pFP, inputs.pTN, inputs.pFN
        );
        break;
      case 'biasIndex':
        resultValue = calculateCompositeBiasIndex({
          disparateImpactRatio: inputs.disparateImpactRatio,
          demographicParityDifference: inputs.demographicParityDifference,
          embeddingCosineSkew: inputs.embeddingCosineSkew,
          w1: inputs.w1,
          w2: inputs.w2,
          w3: inputs.w3
        });
        break;
      case 'biasMitigation':
        resultValue = calculateUtilityWeightedEfficacy(
          inputs.mitigationEfficacyIndex,
          inputs.utilityRaw,
          inputs.utilityMitigated
        );
        break;
      case 'bleu':
        resultValue = calculateBLEU(String(inputs.candidate), String(inputs.reference));
        break;
      case 'complianceAdaptability':
        resultValue = calculateCompositeComplianceAdaptability({
          policyDecouplingRatio: inputs.policyDecouplingRatio,
          policyPropagationLatencyScore: inputs.policyPropagationLatencyScore,
          unlearningEfficiency: inputs.unlearningEfficiency,
          w1: inputs.w1,
          w2: inputs.w2,
          w3: inputs.w3
        });
        break;
      case 'customDrift':
        resultValue = calculateCustomDrift(inputs.expectedDistribution, inputs.actualDistribution);
        break;
      case 'dataDrift':
        resultValue = calculateDataDrift(inputs.expectedDistribution, inputs.actualDistribution);
        break;
      case 'disparateImpact':
        resultValue = calculateDI(
          inputs.unprivSelected, inputs.unprivTotal,
          inputs.privSelected, inputs.privTotal
        );
        break;
      case 'equalOpportunityDifference':
        resultValue = calculateEOD(
          inputs.unprivTP, inputs.unprivQual,
          inputs.privTP, inputs.privQual
        );
        break;
      case 'modelDrift':
        resultValue = calculateModelDrift(inputs.baselinePerformance, inputs.currentPerformance);
        break;
      case 'perplexity':
        resultValue = calculatePerplexity(inputs.logProbabilities);
        break;
      case 'privacyIntegrity':
        resultValue = calculateCompositePrivacyIntegrity({
          leakageScore: inputs.leakageScore,
          membershipInferenceAdvantage: inputs.membershipInferenceAdvantage,
          epsilon: inputs.epsilon,
          epsilonTarget: inputs.epsilonTarget,
          wLeak: inputs.wLeak,
          wMIA: inputs.wMIA,
          wDP: inputs.wDP
        });
        break;
      case 'provenanceCompleteness':
        resultValue = calculateProvenanceCompletenessScore({
          entailmentIndicators: inputs.entailmentIndicators,
          citationIndicators: inputs.citationIndicators,
          alpha: inputs.alpha
        });
        break;
      case 'reasoningCorrectness':
        resultValue = calculateRC(inputs.llmSteps, inputs.goldSteps);
        break;
      case 'rougeN':
        resultValue = rougeN(String(inputs.candidate), String(inputs.reference), Number(inputs.n) || 1).f1;
        break;
      case 'rougeL':
        resultValue = rougeL(String(inputs.candidate), String(inputs.reference)).f1;
        break;
      case 'rougeS':
        resultValue = rougeS(String(inputs.candidate), String(inputs.reference)).f1;
        break;
      case 'statisticalParityDifference':
        resultValue = calculateSPD(
          inputs.unprivSelected, inputs.unprivTotal,
          inputs.privSelected, inputs.privTotal
        );
        break;
      case 'stepwiseIntegrity':
        resultValue = calculateSI(inputs.steps);
        break;
      case 'traceabilityExplainability':
        resultValue = calculateTE(inputs.steps);
        break;
      case 'transparencyScore':
        resultValue = calculateTS(inputs.factors);
        break;
      case 'truthfulQA':
        resultValue = calculateTruthfulQA(inputs.truthfulResponses, inputs.totalResponses);
        break;
      default:
        return { status: 'error', reason: `Unknown metricId: ${metricId}` };
    }

    // Handle NaN or invalid results
    if (typeof resultValue !== 'number' || Number.isNaN(resultValue)) {
      return { status: 'error', reason: 'Metric function returned NaN or invalid result.' };
    }

    return { status: 'calculated', value: resultValue };
  } catch (error: any) {
    return { 
      status: 'error', 
      reason: error?.message ? String(error.message) : 'Unknown error occurred during calculation'
    };
  }
}
