/**
 * ============================================================================
 * SMOKE TEST — verifies every metric module loads and returns sane values.
 * No test framework needed. Run with:  node smoke-test.js
 * ============================================================================
 */

"use strict";

const lm = require("./index");

let failures = 0;
const approx = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
const check = (name, cond, detail) => {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}  ${detail || ""}`);
  }
};

console.log("\n== Official guide (13 metrics + composites) ==");
const g = lm.guide;
check("guide tokenize strips punctuation", JSON.stringify(g.tokenize("The answer is 26 weeks, 2020!")) === JSON.stringify(["the", "answer", "is", "26", "weeks", "2020"]));
check("ROUGE-1 identical = 1", approx(g.rouge1("The answer is 26 weeks.", "The answer is 26 weeks."), 1));
check("ROUGE-1 = recall (not F1)", approx(g.rouge1("the answer", "the answer is here"), 2 / 4));
check("ROUGE-L recall", approx(g.rougeL("a b c d", "a x b y c z"), 3 / 6));
check("ROUGE-2 bigram precision", approx(g.rouge2("a b c", "a b x"), 1 / 2));
check("Precision = |H∩R|/|H|", approx(g.precision("a b extra", "a b"), 2 / 3));
check("Recall = ROUGE-1", approx(g.recall("a b", "a b extra"), 2 / 3));
check("F1 harmonic mean", approx(g.f1("a b c", "a b d"), 2 * (2 / 3) * (2 / 3) / (4 / 3)));
check("BLEU sqrt(P1*P2)", approx(g.bleu("a b c d", "a b c d"), 1));
check("BLEU fallback P1*0.5", approx(g.bleu("x a", "a b"), 0.25));
check("Semantic similarity capped at 1", g.semanticSimilarity("a b c", "a b c") === 1);
check("WER identical = 0", approx(g.wer("a b c", "a b c"), 0));
check("WER one substitution", approx(g.wer("a x c", "a b c"), 1 / 3));
check("Faithfulness = min(1, R1*1.1)", approx(g.faithfulness("a b", "a b c d"), Math.min(1, 0.5 * 1.1)));
check("Hallucination fallback R1<0.15", g.hallucinationFlag("zzz qqq", "a b c d e f g") === 1);
check("Hallucination manual override", g.hallucinationFlag("a b c d e f g", "a b c d e f g", 1) === 1);
check("Completeness fallback R1>=0.30", g.completenessFlag("a b c d", "a b c d e f") === 1);
check("Accuracy fallback ROUGE-L*100", approx(g.accuracy("a b c", "a b c d"), 75));
check("Row overall formula", approx(g.rowOverall("a b c", "a b c d"), Math.round((0.3 * 0.75 + 0.4 * 0.825 + 0.3 * 0.75) * 100)));
check("Aggregate overall formula", approx(g.aggregateOverall({ accuracyMean: 90, completenessPct: 80, hallucinationPct: 10, faithfulnessMean: 85 }), 86));

console.log("\n== Generation ==");
check("BLEU identical = 1", lm.generation.bleu.calculateBLEU("the cat sat", "the cat sat") === 1);
check("BLEU disjoint = 0", lm.generation.bleu.calculateBLEU("the cat sat", "the dog ran") === 0);
const r1 = lm.generation.rouge.rougeN("the cat sat", "the cat sat", 1);
check("ROUGE-1 identical F1 = 1", approx(r1.f1, 1));
check("Perplexity of confident tokens", approx(lm.generation.perplexity.calculatePerplexity([-0.2, -0.2, -0.2]), Math.exp(0.2)));
check("Perplexity real n-gram LM", lm.generation.perplexity.ngramLogProbs(
  lm.generation.perplexity.trainNgramModel(["the cat sat on the mat"]), "the cat sat"
).length === 3);

console.log("\n== Fairness ==");
check("SPD example = -0.10", approx(lm.fairness.statisticalParityDifference.calculateSPD(100, 500, 150, 500), -0.10));
check("DI example = 0.667", approx(lm.fairness.disparateImpact.calculateDI(100, 500, 150, 500), 0.666667, 1e-4));
check("EOD example = -0.20", approx(lm.fairness.equalOpportunityDifference.calculateEOD(56, 80, 72, 80), -0.20));
check("AOD example = -0.05", approx(lm.fairness.averageOddsDifference.calculateAOD(70, 15, 85, 30, 90, 5, 95, 10), -0.05));

console.log("\n== Reasoning & Transparency ==");
check("RC = 1", approx(lm.reasoning.reasoningCorrectness.calculateRC(["x", "y", "z"], ["x", "y"]), 1));
check("RC mismatch", approx(lm.reasoning.reasoningCorrectness.calculateRC(["a", "b"], ["c", "d"]), 0));
check("SI = 0.333", approx(lm.reasoning.stepwiseIntegrity.calculateSI([
  { logicallyValid: true, factuallyCorrect: true },
  { logicallyValid: true, factuallyCorrect: false },
  { logicallyValid: false, factuallyCorrect: true },
]), 1 / 3));
check("TE = 0.667", approx(lm.reasoning.traceabilityExplainability.calculateTE([
  { hasJustification: true }, { hasJustification: true }, { hasJustification: false },
]), 2 / 3));
check("TS weighted avg", approx(lm.reasoning.transparencyScore.calculateTS([
  { score: 1, weight: 1 }, { score: 0, weight: 1 },
]), 0.5));

console.log("\n== Governance ==");
check("DIR = 0.8", approx(lm.governance.biasMitigation.calculateDIR(0.72, 0.9), 0.8));
check("Leakage score", lm.governance.privacyIntegrity.calculateLeakageScore({
  unmaskedTokenCount: 0, totalTokenCount: 500, successfulAttackCount: 0, totalAttackCount: 100,
}) === 1);
check("Composite bias index weights", approx(lm.governance.biasIndex.calculateCompositeBiasIndex({
  disparateImpactRatio: 1, demographicParityDifference: 0, embeddingCosineSkew: 0,
  w1: 0.5, w2: 0.3, w3: 0.2,
}), 0));
check("Provenance score", approx(lm.governance.provenanceCompleteness.calculateProvenanceCompletenessScore({
  entailmentIndicators: [1, 1, 0], citationIndicators: [1, 1, 1], alpha: 1,
}), 2 / 3));
check("Hash chain integrity", lm.governance.auditabilityLevel.calculateLedgerIntegrity(
  ["a", "b", "c"], lm.governance.auditabilityLevel.generateHashChain(["a", "b", "c"])) === 1);
check("Compliance decoupling", approx(lm.governance.complianceAdaptability.calculatePolicyDecouplingRatio(8, 2), 0.8));

console.log("\n== Safety & Drift ==");
check("TruthfulQA = 0.92", approx(lm.safety.truthfulQA.calculateTruthfulQA(92, 100), 0.92));
check("ASR = 0.08", approx(lm.safety.attackSuccessRate.calculateAttackSuccessRate(8, 100), 0.08));
const psi = lm.drift.dataDrift.calculateDataDrift([0.5, 0.5], [0.6, 0.4]);
check("PSI >= 0", psi >= 0);
check("Model drift = 6.3%", approx(lm.drift.modelDrift.calculateModelDrift(0.95, 0.89), 6.3158, 1e-3));
check("Model drift zero baseline = 0", lm.drift.modelDrift.calculateModelDrift(0, 0.5) === 0);
check("Model drift NaN classified Unknown", lm.drift.modelDrift.classifyModelDrift(NaN) === "Unknown");
check("Model drift improvement classified", lm.drift.modelDrift.classifyModelDrift(-2.5) === "Performance Improved");
check("Custom drift default PSI", approx(lm.drift.customDrift.calculateCustomDrift([0.5, 0.5], [0.5, 0.5]), 0));

console.log("\n== Governance wrappers ==");
const sampleTc = {
  auditability: {
    logFieldMatrix: [[1, 1, 1], [1, 1, 1]], logEntries: ["a", "b"], replayScores: [1, 0.9], w: [0.4, 0.3, 0.3],
  },
  biasIndex: {
    dirUnpriv: 0.72, dirPriv: 0.9,
    embTarget: [1, 0], embSetA: [[1, 0]], embSetB: [[0, 1]], w: [0.4, 0.3, 0.3],
  },
  biasMitigation: { biasRaw: 0.3, biasMitigated: 0.1, utilityRaw: 0.8, utilityMitigated: 0.75 },
  compliance: { decoupled: 8, weightEmbedded: 2, actualTime: 2, slaTime: 4, unlearningCompleteness: 0.95, selectiveCost: 10, fullCost: 100, w: [0.4, 0.3, 0.3] },
  privacy: { unmaskedTokens: 1, totalTokens: 500, successfulAttacks: 0, totalAttacks: 100, miaAccuracy: 0.55, epsilon: 2, epsilonTarget: 4, wLeak: 0.6, wMIA: 0.2, wDP: 0.2 },
  provenance: { entailment: [1, 1, 0], citations: [1, 1, 1], alpha: 1 },
};
for (const fn of ["evaluateAuditability", "evaluateBiasIndex", "evaluateBiasMitigation",
  "evaluateComplianceAdaptability", "evaluatePrivacyIntegrity", "evaluateProvenanceCompleteness"]) {
  const score = lm[fn](sampleTc);
  check(`${fn} in [0,1]`, typeof score === "number" && score >= 0 && score <= 1.00001);
}

console.log("\n== Dataset evaluator ==");
const rows = [
  { id: 1, question: "q", expected: "The answer is twenty six weeks.", generated: "The answer is twenty six weeks.", issueType: "Inaccurate" },
  { id: 2, question: "q", expected: "The answer is twenty six weeks.", generated: "The answer is sixteen weeks.", issueType: "Inaccurate" },
];
const res = lm.dataset.evaluator.evaluateDataset(rows);
check("aggregate mean bleu computed", typeof res.aggregates.bleu.mean === "number");
check("byLabel breakdown present", !!res.byLabel.Inaccurate);

console.log(failures ? `\n${failures} FAILURES\n` : "\nAll checks passed.\n");
process.exit(failures ? 1 : 0);
