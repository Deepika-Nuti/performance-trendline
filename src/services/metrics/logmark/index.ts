// CJS Interop Bridge for Logmark Metrics

console.log("INDEX.TS EVALUATED");
function extract(ns: any, key: string) {
  console.log("EXTRACTING", key, "from", Object.keys(ns || {}));
  let res;
  if (ns && ns.default && ns.default[key]) res = ns.default[key];
  else if (ns && ns[key]) res = ns[key];
  else throw new Error(`Cannot extract ${key} from namespace: ${JSON.stringify(ns)}`);
  console.log("EXTRACTED", key, typeof res);
  return res;
}

import * as bleuCjs from './bleu.js';
export const calculateBLEU = extract(bleuCjs, 'calculateBLEU');

import * as rougeCjs from './rouge.js';
export const rougeN = extract(rougeCjs, 'rougeN');
export const rougeL = extract(rougeCjs, 'rougeL');
export const rougeS = extract(rougeCjs, 'rougeS');

import * as perplexityCjs from './perplexity.js';
export const calculatePerplexity = extract(perplexityCjs, 'calculatePerplexity');

import * as truthfulQACjs from './truthfulQA.js';
export const calculateTruthfulQA = extract(truthfulQACjs, 'calculateTruthfulQA');

import * as attackSuccessRateCjs from './attackSuccessRate.js';
export const calculateAttackSuccessRate = extract(attackSuccessRateCjs, 'calculateAttackSuccessRate');

import * as dataDriftCjs from './dataDrift.js';
export const calculateDataDrift = extract(dataDriftCjs, 'calculateDataDrift');

import * as customDriftCjs from './customDrift.js';
export const evaluateCustomDrift = extract(customDriftCjs, 'evaluateCustomDrift');
export const calculateCustomDrift = extract(customDriftCjs, 'calculateCustomDrift');

import * as modelDriftCjs from './modelDrift.js';
export const calculateModelDrift = extract(modelDriftCjs, 'calculateModelDrift');
export const classifyModelDrift = extract(modelDriftCjs, 'classifyModelDrift');

import * as statisticalParityDifferenceCjs from './statisticalParityDifference.js';
export const calculateSPD = extract(statisticalParityDifferenceCjs, 'calculateSPD');

import * as disparateImpactCjs from './disparateImpact.js';
export const calculateDI = extract(disparateImpactCjs, 'calculateDI');

import * as equalOpportunityDifferenceCjs from './equalOpportunityDifference.js';
export const calculateEOD = extract(equalOpportunityDifferenceCjs, 'calculateEOD');

import * as averageOddsDifferenceCjs from './averageOddsDifference.js';
export const calculateAOD = extract(averageOddsDifferenceCjs, 'calculateAOD');

import * as reasoningCorrectnessCjs from './reasoningCorrectness.js';
export const calculateRC = extract(reasoningCorrectnessCjs, 'calculateRC');

import * as stepwiseIntegrityCjs from './stepwiseIntegrity.js';
export const calculateSI = extract(stepwiseIntegrityCjs, 'calculateSI');

import * as traceabilityExplainabilityCjs from './traceabilityExplainability.js';
export const calculateTE = extract(traceabilityExplainabilityCjs, 'calculateTE');

import * as transparencyScoreCjs from './transparencyScore.js';
export const calculateTS = extract(transparencyScoreCjs, 'calculateTS');

// --- GOVERNANCE COMPOSITES ---

import * as biasMitigationCjs from './biasMitigation.js';
export const calculateUtilityWeightedEfficacy = extract(biasMitigationCjs, 'calculateUtilityWeightedEfficacy');
export const calculateDIR_mitigation = extract(biasMitigationCjs, 'calculateDIR');
export const calculateEqualizedOddsVariance = extract(biasMitigationCjs, 'calculateEqualizedOddsVariance');
export const calculateMitigationEfficacyIndex = extract(biasMitigationCjs, 'calculateMitigationEfficacyIndex');

import * as biasIndexCjs from './biasIndex.js';
export const calculateCompositeBiasIndex = extract(biasIndexCjs, 'calculateCompositeBiasIndex');
export const calculateDIR_biasIndex = extract(biasIndexCjs, 'calculateDIR');
export const calculateDemographicParityDifference = extract(biasIndexCjs, 'calculateDemographicParityDifference');
export const calculateEmbeddingCosineSkew = extract(biasIndexCjs, 'calculateEmbeddingCosineSkew');

import * as privacyIntegrityCjs from './privacyIntegrity.js';
export const calculateCompositePrivacyIntegrity = extract(privacyIntegrityCjs, 'calculateCompositePrivacyIntegrity');
export const calculateLeakageScore = extract(privacyIntegrityCjs, 'calculateLeakageScore');
export const checkDifferentialPrivacyGuarantee = extract(privacyIntegrityCjs, 'checkDifferentialPrivacyGuarantee');
export const calculateMembershipInferenceAdvantage = extract(privacyIntegrityCjs, 'calculateMembershipInferenceAdvantage');

import * as provenanceCompletenessCjs from './provenanceCompleteness.js';
export const calculateProvenanceCompletenessScore = extract(provenanceCompletenessCjs, 'calculateProvenanceCompletenessScore');
export const calculateBaseProvenanceScore = extract(provenanceCompletenessCjs, 'calculateBaseProvenanceScore');

import * as auditabilityLevelCjs from './auditabilityLevel.js';
export const calculateCompositeAuditability = extract(auditabilityLevelCjs, 'calculateCompositeAuditability');
export const calculateLogFieldCompleteness = extract(auditabilityLevelCjs, 'calculateLogFieldCompleteness');
export const calculateLedgerIntegrity = extract(auditabilityLevelCjs, 'calculateLedgerIntegrity');
export const calculateReplayEquivalence = extract(auditabilityLevelCjs, 'calculateReplayEquivalence');

import * as complianceAdaptabilityCjs from './complianceAdaptability.js';
export const calculateCompositeComplianceAdaptability = extract(complianceAdaptabilityCjs, 'calculateCompositeComplianceAdaptability');
export const calculatePolicyDecouplingRatio = extract(complianceAdaptabilityCjs, 'calculatePolicyDecouplingRatio');
export const calculatePolicyPropagationLatencyScore = extract(complianceAdaptabilityCjs, 'calculatePolicyPropagationLatencyScore');
export const calculateUnlearningEfficiency = extract(complianceAdaptabilityCjs, 'calculateUnlearningEfficiency');

import * as guideMetricsCjs from './guideMetrics.js';
export const rouge1 = extract(guideMetricsCjs, 'rouge1');
export const rougeL_guide = extract(guideMetricsCjs, 'rougeL');
export const rouge2 = extract(guideMetricsCjs, 'rouge2');
export const precision = extract(guideMetricsCjs, 'precision');
export const recall = extract(guideMetricsCjs, 'recall');
export const f1 = extract(guideMetricsCjs, 'f1');
export const bleu = extract(guideMetricsCjs, 'bleu');
export const semanticSimilarity = extract(guideMetricsCjs, 'semanticSimilarity');
export const wer = extract(guideMetricsCjs, 'wer');
export const faithfulness = extract(guideMetricsCjs, 'faithfulness');
export const hallucinationFlag = extract(guideMetricsCjs, 'hallucinationFlag');
export const completenessFlag = extract(guideMetricsCjs, 'completenessFlag');
export const accuracy = extract(guideMetricsCjs, 'accuracy');
export const rowOverall = extract(guideMetricsCjs, 'rowOverall');
export const aggregateOverall = extract(guideMetricsCjs, 'aggregateOverall');
export const evaluateGuideRow = extract(guideMetricsCjs, 'evaluateGuideRow');
import * as datasetEvaluatorCjs from './datasetEvaluator.js';
export const normalize = extract(datasetEvaluatorCjs, 'normalize');

