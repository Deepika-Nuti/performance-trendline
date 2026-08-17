import { 
  rouge1, rougeL_guide, rouge2, precision, recall, f1, bleu, semanticSimilarity, wer, faithfulness, hallucinationFlag, completenessFlag, accuracy, rowOverall, aggregateOverall,
  calculateBLEU, rougeN, rougeL, rougeS, calculatePerplexity, calculateTruthfulQA, calculateAttackSuccessRate, calculateDataDrift, evaluateCustomDrift, calculateCustomDrift, calculateModelDrift,
  calculateSPD, calculateDI, calculateEOD, calculateAOD, calculateRC, calculateSI, calculateTE, calculateTS,
  calculateUtilityWeightedEfficacy, calculateDIR_mitigation, calculateEqualizedOddsVariance, calculateMitigationEfficacyIndex,
  calculateCompositeBiasIndex, calculateDIR_biasIndex, calculateDemographicParityDifference, calculateEmbeddingCosineSkew,
  calculateCompositePrivacyIntegrity, calculateLeakageScore, checkDifferentialPrivacyGuarantee, calculateMembershipInferenceAdvantage,
  calculateProvenanceCompletenessScore, calculateBaseProvenanceScore,
  calculateCompositeAuditability, calculateLogFieldCompleteness, calculateLedgerIntegrity, calculateReplayEquivalence,
  calculateCompositeComplianceAdaptability, calculatePolicyDecouplingRatio, calculatePolicyPropagationLatencyScore, calculateUnlearningEfficiency
} from '../metrics/logmark/index.js';

import {
  buildGuideMetricInputs,
  buildRowLevelTextInputs,
  buildPerplexityInputs,
  buildTruthfulQAInputs,
  buildModelDriftInputs,
  buildAttackSuccessRateInputs,
  buildDataDriftInputs,
  buildCustomDriftInputs,
  buildFairnessInputs,
  buildReasoningInputs,
  buildGovernanceInputs,
  buildUnavailableInput,
  buildAggregateOverallInputs
} from './inputBuilders';

import { normalize } from '../metrics/logmark/index.js';

// 1. guideMetrics (we select 10 to ensure exactly 34 metrics with the 24 core)
const guideRegistry = [
  { id: 'rouge-1-guide', name: 'ROUGE-1 (Guide)', description: 'Overlap of unigrams between generated and expected answers.', category: 'Guide Metrics', implementation: rouge1, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'rouge-l-guide', name: 'ROUGE-L (Guide)', description: 'Longest Common Subsequence overlap.', category: 'Guide Metrics', implementation: rougeL_guide, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'rouge-2-guide', name: 'ROUGE-2 (Guide)', description: 'Overlap of bigrams between generated and expected answers.', category: 'Guide Metrics', implementation: rouge2, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'precision', name: 'Precision', description: 'Fraction of generated words that appear in the expected answer.', category: 'Guide Metrics', implementation: precision, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'recall', name: 'Recall', description: 'Fraction of expected words that appear in the generated answer.', category: 'Guide Metrics', implementation: recall, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'f1', name: 'F1 Score', description: 'Harmonic mean of precision and recall.', category: 'Guide Metrics', implementation: f1, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'bleu-guide', name: 'BLEU (Guide)', description: 'Measures word-for-word match against a reference.', category: 'Guide Metrics', implementation: bleu, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'semantic-similarity', name: 'Semantic Similarity', description: 'Cosine similarity between embeddings of the generated and expected text.', category: 'Guide Metrics', implementation: semanticSimilarity, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'wer', name: 'WER', description: 'Word Error Rate.', category: 'Guide Metrics', implementation: wer, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: false },
  { id: 'faithfulness', name: 'Faithfulness', description: 'Measures how faithful the generated text is to the provided context.', category: 'Guide Metrics', implementation: faithfulness, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'hallucination-flag', name: 'Hallucination Flag', description: 'Flags rows where the human label marks Type of issue as Hallucination regardless of ROUGE score.', category: 'Guide Metrics', implementation: hallucinationFlag, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: false },
  { id: 'completeness-flag', name: 'Completeness Flag', description: 'Flags rows indicating incomplete answers.', category: 'Guide Metrics', implementation: completenessFlag, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'accuracy', name: 'Accuracy', description: 'General exact match or logical accuracy.', category: 'Guide Metrics', implementation: accuracy, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'row-overall', name: 'Row Overall', description: 'Mean of all available row-level metrics excluding any with status not_available.', category: 'Guide Metrics', implementation: rowOverall, inputBuilder: buildGuideMetricInputs, type: 'row-level' , higherIsBetter: true },
  { id: 'aggregate-overall', name: 'Aggregate Overall', description: 'Weighted average of all available governance metrics (Priority 1: 0.5, Priority 2: 0.3, Priority 3: 0.2).', category: 'Guide Metrics', implementation: aggregateOverall, inputBuilder: (rows, ctx) => buildAggregateOverallInputs(rows, ctx), type: 'aggregate' , higherIsBetter: true },
];

export const registry: any[] = [
  ...guideRegistry, // 15
  { id: 'bleu-4', name: 'BLEU-4', description: 'Measures how much of the model\'s output word-for-word matches a reference.', category: 'Generation Quality', implementation: calculateBLEU, inputBuilder: buildRowLevelTextInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'rouge-n', name: 'ROUGE-N', description: 'n-gram overlap recall/precision/F1.', category: 'Generation Quality', implementation: rougeN, inputBuilder: buildRowLevelTextInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'rouge-l', name: 'ROUGE-L', description: 'Longest Common Subsequence recall/precision/F1.', category: 'Generation Quality', implementation: rougeL, inputBuilder: buildRowLevelTextInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'rouge-s', name: 'ROUGE-S', description: 'Skip-bigram co-occurrence recall/precision/F1.', category: 'Generation Quality', implementation: rougeS, inputBuilder: buildRowLevelTextInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'perplexity', name: 'Perplexity', description: 'How unsure a language model is about the words it generates.', category: 'Generation Quality', implementation: calculatePerplexity, inputBuilder: buildPerplexityInputs, type: 'dataset-level', higherIsBetter: false
  },
  { id: 'truthfulqa', name: 'TruthfulQA', description: 'Measures factual correctness of generated responses.', category: 'Safety', implementation: (inputs: any) => {
      const value = calculateTruthfulQA(inputs.truthfulResponses, inputs.totalResponses);
      return { value, details: inputs.details };
    }, inputBuilder: (rows: any[]) => buildTruthfulQAInputs(rows, (c, r) => (normalize(c) === normalize(r) || semanticSimilarity(c, r) > 0.8) ? 1.0 : 0.0), type: 'aggregate', higherIsBetter: true
  },
  { id: 'attack-success-rate', name: 'Attack Success Rate', description: 'Measures the robustness of an AI model against adversarial or malicious prompts.', category: 'Safety', implementation: (inputs: any) => {
      if (inputs.totalAttackAttempts === 0) {
        return { value: 0, details: { tested: false, note: "no adversarial prompts present in this batch" } };
      }
      return calculateAttackSuccessRate(inputs.successfulAttacks, inputs.totalAttackAttempts);
    }, inputBuilder: buildAttackSuccessRateInputs, type: 'aggregate', higherIsBetter: false
  },
  { id: 'data-drift', name: 'Data Drift', description: 'Measures changes in the statistical distribution of input data.', category: 'Drift', implementation: calculateDataDrift, inputBuilder: (rows: any, ctx: any) => buildDataDriftInputs(ctx), type: 'distribution', higherIsBetter: false
  },
  { id: 'custom-drift', name: 'Custom Drift', description: 'Measures drift using a user-defined statistical method.', category: 'Drift', implementation: evaluateCustomDrift, inputBuilder: (rows: any, ctx: any) => buildCustomDriftInputs(ctx), type: 'distribution', higherIsBetter: false
  },
  { id: 'statistical-parity-difference', name: 'Statistical Parity Difference', description: 'Measures the gap in selection rates between groups.', category: 'Fairness', implementation: calculateSPD, inputBuilder: buildFairnessInputs, type: 'group/aggregate'
  },
  { id: 'disparate-impact', name: 'Disparate Impact', description: 'Ratio of favorable-outcome rates between unprivileged and privileged groups.', category: 'Fairness', implementation: calculateDI, inputBuilder: buildFairnessInputs, type: 'group/aggregate', higherIsBetter: true
  },
  { id: 'equal-opportunity-difference', name: 'Equal Opportunity Difference', description: 'Compares the true positive rate across unprivileged and privileged groups.', category: 'Fairness', implementation: calculateEOD, inputBuilder: buildFairnessInputs, type: 'group/aggregate'
  },
  { id: 'average-odds-difference', name: 'Average Odds Difference', description: 'Group fairness metric comparing TPR and FPR between unprivileged and privileged groups.', category: 'Fairness', implementation: calculateAOD, inputBuilder: buildFairnessInputs, type: 'group/aggregate'
  },
  { id: 'reasoning-correctness', name: 'Reasoning Correctness', description: 'Fraction of gold-standard reasoning steps reproduced correctly.', category: 'Reasoning & Transparency', implementation: calculateRC, inputBuilder: buildReasoningInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'stepwise-integrity', name: 'Stepwise Integrity', description: 'Fraction of reasoning steps that are both logically valid and factually correct.', category: 'Reasoning & Transparency', implementation: calculateSI, inputBuilder: buildReasoningInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'traceability-explainability', name: 'Traceability/Explainability', description: 'Fraction of reasoning steps that carry a justification or cited source.', category: 'Reasoning & Transparency', implementation: calculateTE, inputBuilder: buildReasoningInputs, type: 'row-level', higherIsBetter: true
  },
  { id: 'transparency-score', name: 'Transparency Score', description: 'Weighted average of transparency factors.', category: 'Reasoning & Transparency', implementation: calculateTS, inputBuilder: () => buildGovernanceInputs(null), type: 'configuration', higherIsBetter: true
  },
  { id: 'bias-mitigation', name: 'Bias Mitigation', description: 'Measures delta improvement in bias after interventions.', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_mitigation(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const eqOdds = calculateEqualizedOddsVariance({ tprGroup0: args?.tprGroup0 || 0.8, tprGroup1: args?.tprGroup1 || 0.85, fprGroup0: args?.fprGroup0 || 0.1, fprGroup1: args?.fprGroup1 || 0.12 });
      const efficacy = calculateMitigationEfficacyIndex(args?.tprGroup0 || 0.2, args?.fprGroup0 || 0.1);
      const value = calculateUtilityWeightedEfficacy(efficacy, args?.tprGroup1 || 0.9, args?.fprGroup1 || 0.88);
      return { value, details: { DIR: dir, equalizedOddsVariance: eqOdds, mitigationEfficacyIndex: efficacy } };
    },
    inputBuilder: buildUnavailableInput('requires protected-attribute labels and historical outcome data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'bias-index', name: 'Bias Index', description: 'Quantifies the absolute magnitude of skew and disparity.', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_biasIndex(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const dpd = calculateDemographicParityDifference(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const skew = calculateEmbeddingCosineSkew([1, 0, 0], [[1, 0, 0]], [[0, 1, 0]]);
      const value = calculateCompositeBiasIndex({ disparateImpactRatio: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { DIR: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew } };
    },
    inputBuilder: buildUnavailableInput('requires protected-attribute labels, outcome data, and vector embeddings, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'privacy-integrity', name: 'Privacy Integrity', description: 'Capability to prevent unauthorized exposure of sensitive information.', category: 'Governance',
    implementation: (args: any) => {
      const leakage = calculateLeakageScore({ unmaskedTokenCount: args?.unmaskedTokenCount || 5, totalTokenCount: args?.totalTokenCount || 100, successfulAttackCount: 1, totalAttackCount: 50 });
      const dp = checkDifferentialPrivacyGuarantee({ probOutputGivenD: 0.1, probOutputGivenDPrime: 0.05, epsilon: 1.0, delta: 1e-5 });
      const mia = calculateMembershipInferenceAdvantage(0.55);
      const value = calculateCompositePrivacyIntegrity({ leakageScore: leakage, membershipInferenceAdvantage: mia, epsilon: 1.0, epsilonTarget: 1.0, wLeak: 0.4, wMIA: 0.3, wDP: 0.3 });
      return { value, details: { leakageScore: leakage, differentialPrivacy: dp, membershipInferenceAdvantage: mia } };
    },
    inputBuilder: buildUnavailableInput('requires differential-privacy configuration and attack simulation logs, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'provenance-completeness', name: 'Provenance Completeness', description: 'Quantifies traceability and semantic alignment of generated text against source context.', category: 'Governance',
    implementation: (args: any) => {
      const ei = args?.entailmentIndicators || [1, 1, 0, 1];
      const ci = args?.citationIndicators || [1, 0, 0, 1];
      const base = calculateBaseProvenanceScore(ei);
      const value = calculateProvenanceCompletenessScore({ entailmentIndicators: ei, citationIndicators: ci, alpha: 0.5 });
      return { value, details: { baseProvenanceScore: base } };
    },
    inputBuilder: buildUnavailableInput('requires structured citation array and source corpus entailment indicators, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'auditability-level', name: 'Auditability Level', description: 'Measures completeness, tamper-resistance, and replayability of an AI system\'s history.', category: 'Governance',
    implementation: (args: any) => {
      const logField = calculateLogFieldCompleteness(args?.logFieldCompleteness || [[true, true], [true, false]]);
      const ledger = calculateLedgerIntegrity(args?.ledgerElements || ["a", "b"], args?.ledgerElements || ["hash1", "hash2"]);
      const replay = calculateReplayEquivalence(args?.replayEquivalence || [0.9, 0.95]);
      const value = calculateCompositeAuditability({ logFieldCompleteness: logField, ledgerIntegrity: 0.5, replayEquivalence: replay, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { logFieldCompleteness: logField, ledgerIntegrity: ledger, replayEquivalence: replay } };
    },
    inputBuilder: buildUnavailableInput('requires structured audit log with hash-chain data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'compliance-adaptability', name: 'Compliance Adaptability', description: 'Measures speed and efficiency of incorporating new regulatory constraints.', category: 'Governance',
    implementation: (args: any) => {
      const decouple = calculatePolicyDecouplingRatio(args?.policyDecouplingRatio || 10, 2);
      const latency = calculatePolicyPropagationLatencyScore(args?.latency || 120, 100);
      const unlearn = calculateUnlearningEfficiency({ unlearningCompleteness: 0.9, selectiveUnlearnCost: 50, fullRetrainingCost: 1000 });
      const value = calculateCompositeComplianceAdaptability({ policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn } };
    },
    inputBuilder: buildUnavailableInput('requires system policy latency configuration and unlearning efficiency data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'
  },
  { id: 'model-drift', name: 'Model Drift', description: 'Measures the degradation in an AI model\'s performance over time.', category: 'Drift', implementation: calculateModelDrift, inputBuilder: (rows: any, ctx: any) => buildModelDriftInputs(ctx), type: 'historical', higherIsBetter: false }
];
