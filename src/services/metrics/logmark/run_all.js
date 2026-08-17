/**
 * ============================================================================
 * RUN ALL — demonstrates every Logmark metric with sample data.
 * Run with:  node run_all.js
 *
 * Covers all 21 metric modules plus the official 13 guide metrics.
 * ============================================================================
 */

"use strict";

const lm = require("./index");
const fmt = (x, d = 4) => (typeof x === "number" ? x.toFixed(d) : String(x));
const line = () => console.log("-".repeat(72));

console.log("LOGMARK OFFICIAL MAIN — all metrics demo\n");

// ── 0. Official guide (13 core metrics) ────────────────────────────────────
line();
console.log("OFFICIAL GUIDE — 13 metrics (Logmark_SLM_Forge_Metrics_Guide)");
const expected = "the employee receives twenty six weeks of maternity leave";
const generated = "an employee gets twenty six weeks maternity leave";
console.log("  expected :", expected);
console.log("  generated:", generated);
console.log("  ", JSON.stringify(lm.guide.evaluateGuideRow(expected, generated)));
console.log("  Aggregate Overall (example):",
  lm.guide.aggregateOverall({ accuracyMean: 90, completenessPct: 80, hallucinationPct: 10, faithfulnessMean: 85 }));

// ── 1. Perplexity ──────────────────────────────────────────────────────────
line();
console.log("1. PERPLEXITY");
const model = lm.generation.perplexity.trainNgramModel([
  "the cat sat on the mat and watched the bird",
  "the quick brown fox jumps over the lazy dog",
]);
const ppl = lm.generation.perplexity.ngramLogProbs(model, "the cat sat on the mat");
console.log("  Perplexity (real trigram LM, add-delta smoothing):",
  fmt(lm.generation.perplexity.calculatePerplexity(ppl)));

// ── 2. ROUGE Score ─────────────────────────────────────────────────────────
line();
console.log("2. ROUGE SCORE");
console.log("  ROUGE-1:", JSON.stringify(lm.generation.rouge.rougeN(generated, expected, 1)));
console.log("  ROUGE-2:", JSON.stringify(lm.generation.rouge.rougeN(generated, expected, 2)));
console.log("  ROUGE-L:", JSON.stringify(lm.generation.rouge.rougeL(generated, expected)));
console.log("  ROUGE-S:", JSON.stringify(lm.generation.rouge.rougeS(generated, expected)));

// ── 3. BLEU Score ──────────────────────────────────────────────────────────
line();
console.log("3. BLEU SCORE");
console.log("  BLEU-4:", fmt(lm.generation.bleu.calculateBLEU(generated, expected)));

// ── 4. Bias Mitigation ─────────────────────────────────────────────────────
line();
console.log("4. BIAS MITIGATION");
console.log("  Disparate Impact Ratio:", fmt(lm.governance.biasMitigation.calculateDIR(0.72, 0.9)));
console.log("  Equalized Odds Variance:", fmt(lm.governance.biasMitigation.calculateEqualizedOddsVariance({
  tprGroup0: 0.8, tprGroup1: 0.7, fprGroup0: 0.2, fprGroup1: 0.1,
})));
console.log("  Mitigation Efficacy Index:", fmt(lm.governance.biasMitigation.calculateMitigationEfficacyIndex(0.3, 0.1)));
console.log("  Utility-Weighted Efficacy:", fmt(lm.governance.biasMitigation.calculateUtilityWeightedEfficacy(2 / 3, 0.8, 0.75)));

// ── 5. Privacy Integrity (PI) ──────────────────────────────────────────────
line();
console.log("5. PRIVACY INTEGRITY (PI)");
console.log("  Leakage Score:", fmt(lm.governance.privacyIntegrity.calculateLeakageScore({
  unmaskedTokenCount: 1, totalTokenCount: 500, successfulAttackCount: 0, totalAttackCount: 100,
})));
console.log("  MIA Advantage:", fmt(lm.governance.privacyIntegrity.calculateMembershipInferenceAdvantage(0.55)));
console.log("  DP Guarantee:", JSON.stringify(lm.governance.privacyIntegrity.checkDifferentialPrivacyGuarantee({
  probOutputGivenD: 0.01, probOutputGivenDPrime: 0.02, epsilon: 2, delta: 1e-5,
})));
console.log("  Composite PI:", fmt(lm.governance.privacyIntegrity.calculateCompositePrivacyIntegrity({
  leakageScore: 0.998, membershipInferenceAdvantage: 0.1, epsilon: 2, epsilonTarget: 4,
  wLeak: 0.6, wMIA: 0.2, wDP: 0.2,
})));

// ── 6. Bias Index ──────────────────────────────────────────────────────────
line();
console.log("6. BIAS INDEX");
console.log("  DIR:", fmt(lm.governance.biasIndex.calculateDIR(0.72, 0.9)));
console.log("  Demographic Parity Difference:", fmt(lm.governance.biasIndex.calculateDemographicParityDifference(0.72, 0.9)));
console.log("  Embedding Cosine Skew (WEAT):", fmt(lm.governance.biasIndex.calculateEmbeddingCosineSkew(
  [1, 0], [[1, 0], [0.9, 0.1]], [[0, 1], [0.1, 0.9]]
)));
console.log("  Composite Bias Index:", fmt(lm.governance.biasIndex.calculateCompositeBiasIndex({
  disparateImpactRatio: 0.8, demographicParityDifference: 0.18, embeddingCosineSkew: 0.5,
  w1: 0.4, w2: 0.3, w3: 0.3,
})));

// ── 7. Provenance Completeness ─────────────────────────────────────────────
line();
console.log("7. PROVENANCE COMPLETENESS");
console.log("  Base Provenance (RAGAS Faithfulness):",
  fmt(lm.governance.provenanceCompleteness.calculateBaseProvenanceScore([1, 1, 0, 1])));
console.log("  Provenance Completeness Score:",
  fmt(lm.governance.provenanceCompleteness.calculateProvenanceCompletenessScore({
    entailmentIndicators: [1, 1, 0, 1], citationIndicators: [1, 1, 1, 1], alpha: 0.5,
  })));

// ── 8. Auditability Level ──────────────────────────────────────────────────
line();
console.log("8. AUDITABILITY LEVEL");
const entries = ["run1", "run2", "run3"];
const chain = lm.governance.auditabilityLevel.generateHashChain(entries);
console.log("  Log Field Completeness:", fmt(lm.governance.auditabilityLevel.calculateLogFieldCompleteness([
  [1, 1, 1], [1, 1, 1], [1, 1, 1],
])));
console.log("  Ledger Integrity:", fmt(lm.governance.auditabilityLevel.calculateLedgerIntegrity(entries, chain)));
console.log("  Replay Equivalence:", fmt(lm.governance.auditabilityLevel.calculateReplayEquivalence([1, 0.95, 0.9])));
console.log("  Composite Auditability:", fmt(lm.governance.auditabilityLevel.calculateCompositeAuditability({
  logFieldCompleteness: 1, ledgerIntegrity: 1, replayEquivalence: 0.95, w1: 0.4, w2: 0.3, w3: 0.3,
})));

// ── 9. Compliance Adaptability Score ───────────────────────────────────────
line();
console.log("9. COMPLIANCE ADAPTABILITY SCORE");
console.log("  Policy Decoupling Ratio:", fmt(lm.governance.complianceAdaptability.calculatePolicyDecouplingRatio(8, 2)));
console.log("  Propagation Latency Score:", fmt(lm.governance.complianceAdaptability.calculatePolicyPropagationLatencyScore(2, 4)));
console.log("  Unlearning Efficiency:", fmt(lm.governance.complianceAdaptability.calculateUnlearningEfficiency({
  unlearningCompleteness: 0.95, selectiveUnlearnCost: 10, fullRetrainingCost: 100,
})));
console.log("  Composite Compliance Adaptability:", fmt(lm.governance.complianceAdaptability.calculateCompositeComplianceAdaptability({
  policyDecouplingRatio: 0.8, policyPropagationLatencyScore: 1, unlearningEfficiency: 0.855,
  w1: 0.4, w2: 0.3, w3: 0.3,
})));

// ── 10. TruthfulQA ─────────────────────────────────────────────────────────
line();
console.log("10. TRUTHFULQA");
console.log("  TruthfulQA:", fmt(lm.safety.truthfulQA.calculateTruthfulQA(92, 100)));

// ── 11. Attack Success Rate (ASR) ──────────────────────────────────────────
line();
console.log("11. ATTACK SUCCESS RATE (ASR)");
console.log("  Successful attacks:", lm.safety.attackSuccessRate.countSuccessfulAttacks([true, false, true, false, false]));
console.log("  ASR:", fmt(lm.safety.attackSuccessRate.calculateAttackSuccessRate(8, 100)),
  "->", lm.safety.attackSuccessRate.classifyAttackSuccessRate(0.08));

// ── 12. Model / Data Drift ─────────────────────────────────────────────────
line();
console.log("12. MODEL / DATA DRIFT");
console.log("  Data Drift (PSI):", fmt(lm.drift.dataDrift.calculateDataDrift([0.5, 0.3, 0.2], [0.4, 0.35, 0.25])),
  "->", lm.drift.dataDrift.classifyDataDrift(lm.drift.dataDrift.calculateDataDrift([0.5, 0.3, 0.2], [0.4, 0.35, 0.25])));
console.log("  Model Drift (%):", fmt(lm.drift.modelDrift.calculateModelDrift(0.95, 0.89), 2),
  "->", lm.drift.modelDrift.classifyModelDrift(lm.drift.modelDrift.calculateModelDrift(0.95, 0.89)));

// ── 13. Custom Drift Metrics ───────────────────────────────────────────────
line();
console.log("13. CUSTOM DRIFT METRICS");
console.log("  ", JSON.stringify(lm.drift.customDrift.evaluateCustomDrift([0.5, 0.3, 0.2], [0.45, 0.32, 0.23])));

// ── 14-17. Fairness: SPD, DI, EOD, AOD ─────────────────────────────────────
line();
console.log("14-17. FAIRNESS — SPD / DI / EOD / AOD");
console.log("  SPD:", fmt(lm.fairness.statisticalParityDifference.calculateSPD(100, 500, 150, 500)));
console.log("  DI :", fmt(lm.fairness.disparateImpact.calculateDI(100, 500, 150, 500)));
console.log("  EOD:", fmt(lm.fairness.equalOpportunityDifference.calculateEOD(56, 80, 72, 80)));
console.log("  AOD:", fmt(lm.fairness.averageOddsDifference.calculateAOD(70, 15, 85, 30, 90, 5, 95, 10)));

// ── 18-21. Reasoning & Transparency: RC, TS, SI, TE ────────────────────────
line();
console.log("18-21. REASONING & TRANSPARENCY — RC / TS / SI / TE");
console.log("  RC (Reasoning Correctness):", fmt(lm.reasoning.reasoningCorrectness.calculateRC(
  ["inference the agreement applies", "compute 26 weeks", "conclude eligibility"],
  ["inference the agreement applies", "compute 26 weeks"]
)));
console.log("  TS (Transparency Score):", fmt(lm.reasoning.transparencyScore.calculateTS([
  { score: 0.9, weight: 0.4 }, { score: 0.8, weight: 0.3 }, { score: 0.7, weight: 0.3 },
])));
console.log("  SI (Stepwise Integrity):", fmt(lm.reasoning.stepwiseIntegrity.calculateSI([
  { logicallyValid: true, factuallyCorrect: true },
  { logicallyValid: true, factuallyCorrect: false },
  { logicallyValid: true, factuallyCorrect: true },
])));
console.log("  TE (Traceability & Explainability):", fmt(lm.reasoning.traceabilityExplainability.calculateTE([
  { hasJustification: true }, { hasJustification: true }, { hasJustification: false },
])));

console.log("\nAll metrics demonstrated. Run `node smoke-test.js` to verify correctness.");
