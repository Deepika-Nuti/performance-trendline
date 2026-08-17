/**
 * ============================================================================
 * BASE TEST — golden regression suite for the consolidated Logmark library.
 * ----------------------------------------------------------------------------
 * Deterministic base test covering every exported metric (guide, generation,
 * fairness, reasoning, governance, safety, drift, dataset evaluator and the
 * high-level index wrappers). Fixed golden values are baked in below.
 *
 * This suite MUST be run after ANY change to any metric script — it verifies
 * the calculations still produce the same numbers and flags regressions.
 *
 * Usage:
 *   node base-test.js                  # run checks, print PASS/FAIL, exit 0/1
 *   node base-test.js --golden         # write base-test.golden (current output)
 *   node base-test.js --check-golden   # fail on any diff vs base-test.golden
 * ============================================================================
 */

"use strict";

const fs = require("fs");
const path = require("path");
const lm = require("./index");

const GOLDEN_FILE = path.join(__dirname, "base-test.golden");

/* ── Canonical inputs (shared with run_all.js where applicable) ───────────── */
const EXPECTED = "the employee receives twenty six weeks of maternity leave";
const GENERATED = "an employee gets twenty six weeks maternity leave";

const PPL_CORPUS = [
  "the cat sat on the mat and watched the bird",
  "the quick brown fox jumps over the lazy dog",
];
const PPL_SCORE = "the cat sat on the mat";

const QA_ROWS = [
  { question: "What is the capital of France?", expected: "The capital is Paris.", generated: "the capital is paris!", issueType: "Accurate" },
  { question: "What is 2+2?", expected: "The sum is four.", generated: "the sum is four", issueType: "Accurate" },
  { question: "What is the color of the sky?", expected: "The sky is blue.", generated: "it is green on a cloudy day", issueType: "Inaccurate" },
];

/* ── Runner ───────────────────────────────────────────────────────────────── */
const lines = [];
let passed = 0;
let failed = 0;

function fmt(x) {
  if (typeof x === "number") {
    if (!Number.isFinite(x)) return String(x);
    return String(Number(x.toFixed(6)));
  }
  if (typeof x === "boolean") return String(x);
  return String(x);
}

function emit(kind, label, detail) {
  const line = `${kind} ${label}${detail ? "  " + detail : ""}`;
  lines.push(line);
  console.log(line);
}

/** Compare `actual` to the golden `expected` (float tolerance for numbers). */
function check(label, actual, expected, tol = 1e-6) {
  let ok;
  if (typeof expected === "number") {
    ok = Number.isNaN(expected)
      ? Number.isNaN(actual)
      : typeof actual === "number" && Math.abs(actual - expected) <= tol;
  } else {
    ok = String(actual) === String(expected);
  }
  if (ok) {
    passed++;
    emit("PASS", label, `= ${fmt(actual)}`);
  } else {
    failed++;
    emit("FAIL", label, `expected=${fmt(expected)} got=${fmt(actual)}`);
  }
}

function checkObj(label, actual, expected, tol = 1e-6) {
  for (const key of Object.keys(expected)) {
    check(`${label}.${key}`, actual[key], expected[key], tol);
  }
}

function checkThrows(label, fn) {
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  check(label, threw, true);
}

/* ── Official guide (13 metrics + composites) ─────────────────────────────── */
const g = lm.guide.evaluateGuideRow(EXPECTED, GENERATED);
check("guide.rouge1", g.r1, 0.6666666667);
check("guide.rougeL", g.rl, 0.6666666667);
check("guide.rouge2", g.r2, 0.4285714286);
check("guide.precision", g.precision, 0.75);
check("guide.recall", g.recall, 0.6666666667);
check("guide.f1", g.f1, 0.7058823529);
check("guide.bleu", g.bleu, 0.5669467095);
check("guide.semantic", g.semantic, 0.7);
check("guide.wer", g.wer, 0.3333333333);
check("guide.faithfulness", g.faithfulness, 0.7333333333);
check("guide.hallucination", g.hallucination, 0);
check("guide.completeness", g.completeness, 1);
check("guide.accuracy", g.accuracy, 66.6666666667);
check("guide.rowOverall", g.rowOverall, 69);
check("guide.aggregateOverall",
  lm.guide.aggregateOverall({ accuracyMean: 90, completenessPct: 80, hallucinationPct: 10, faithfulnessMean: 85 }),
  86);
check("guide.hallucination.manual", lm.guide.hallucinationFlag(GENERATED, EXPECTED, 1), 1);
check("guide.completeness.manual", lm.guide.completenessFlag(GENERATED, EXPECTED, 0), 0);
check("guide.accuracy.manual", lm.guide.accuracy(GENERATED, EXPECTED, 92), 92);
check("guide.rouge1.empty", lm.guide.rouge1("", ""), 0);
check("guide.f1Score.zero", lm.guide.f1Score(0, 0), 0);
check("guide.wer.empty", lm.guide.wer("", ""), 0);
check("guide.bleu.empty", lm.guide.bleu("", ""), 0);
check("guide.semantic.identical", lm.guide.semanticSimilarity("the quick brown fox", "the quick brown fox"), 1);

/* ── Generation quality ───────────────────────────────────────────────────── */
const pplModel = lm.generation.perplexity.trainNgramModel(PPL_CORPUS);
const pplLogProbs = lm.generation.perplexity.ngramLogProbs(pplModel, PPL_SCORE);
check("generation.perplexity", lm.generation.perplexity.calculatePerplexity(pplLogProbs), 1.7887670883);
check("generation.perplexity.empty", lm.generation.perplexity.calculatePerplexity([]), NaN);
check("generation.bleu", lm.generation.bleu.calculateBLEU(GENERATED, EXPECTED), 0);
check("generation.bleu.identical", lm.generation.bleu.calculateBLEU(EXPECTED, EXPECTED), 1);
checkObj("generation.rouge1", lm.generation.rouge.rougeN(GENERATED, EXPECTED, 1),
  { recall: 0.6667, precision: 0.75, f1: 0.7059 });
checkObj("generation.rouge2", lm.generation.rouge.rougeN(GENERATED, EXPECTED, 2),
  { recall: 0.375, precision: 0.4286, f1: 0.4 });
checkObj("generation.rougeL", lm.generation.rouge.rougeL(GENERATED, EXPECTED),
  { recall: 0.6667, precision: 0.75, f1: 0.7059 });
checkObj("generation.rougeS", lm.generation.rouge.rougeS(GENERATED, EXPECTED),
  { recall: 0.4167, precision: 0.5357, f1: 0.4688 });

/* ── Fairness ─────────────────────────────────────────────────────────────── */
check("fairness.spd", lm.fairness.statisticalParityDifference.calculateSPD(100, 500, 150, 500), -0.1);
check("fairness.di", lm.fairness.disparateImpact.calculateDI(100, 500, 150, 500), 0.6666666667);
check("fairness.di.bothZero", lm.fairness.disparateImpact.calculateDI(0, 100, 0, 100), 1);
check("fairness.eod", lm.fairness.equalOpportunityDifference.calculateEOD(56, 80, 72, 80), -0.2);
check("fairness.aod", lm.fairness.averageOddsDifference.calculateAOD(70, 15, 85, 30, 90, 5, 95, 10), -0.05);

/* ── Reasoning & transparency ─────────────────────────────────────────────── */
check("reasoning.rc", lm.reasoning.reasoningCorrectness.calculateRC(
  ["inference the agreement applies", "compute 26 weeks", "conclude eligibility"],
  ["inference the agreement applies", "compute 26 weeks"]), 1);
check("reasoning.rc.empty", lm.reasoning.reasoningCorrectness.calculateRC([], []), 1);
check("reasoning.si", lm.reasoning.stepwiseIntegrity.calculateSI([
  { logicallyValid: true, factuallyCorrect: true },
  { logicallyValid: true, factuallyCorrect: false },
  { logicallyValid: true, factuallyCorrect: true },
]), 0.6666666667);
check("reasoning.te", lm.reasoning.traceabilityExplainability.calculateTE([
  { hasJustification: true }, { hasJustification: true }, { hasJustification: false },
]), 0.6666666667);
check("reasoning.ts", lm.reasoning.transparencyScore.calculateTS([
  { score: 0.9, weight: 0.4 }, { score: 0.8, weight: 0.3 }, { score: 0.7, weight: 0.3 },
]), 0.81);

/* ── Governance: bias mitigation ──────────────────────────────────────────── */
check("biasMitigation.dir", lm.governance.biasMitigation.calculateDIR(0.72, 0.9), 0.8);
check("biasMitigation.eov", lm.governance.biasMitigation.calculateEqualizedOddsVariance({
  tprGroup0: 0.8, tprGroup1: 0.7, fprGroup0: 0.2, fprGroup1: 0.1,
}), 0.1);
check("biasMitigation.mei", lm.governance.biasMitigation.calculateMitigationEfficacyIndex(0.3, 0.1), 0.6666666667);
check("biasMitigation.uwe", lm.governance.biasMitigation.calculateUtilityWeightedEfficacy(2 / 3, 0.8, 0.75), 0.625);
checkThrows("biasMitigation.dir.throws", () => lm.governance.biasMitigation.calculateDIR(0.5, 0));

/* ── Governance: privacy integrity ────────────────────────────────────────── */
check("privacy.leakage", lm.governance.privacyIntegrity.calculateLeakageScore({
  unmaskedTokenCount: 1, totalTokenCount: 500, successfulAttackCount: 0, totalAttackCount: 100,
}), 0.9988);
check("privacy.mia", lm.governance.privacyIntegrity.calculateMembershipInferenceAdvantage(0.55), 0.1);
const dp = lm.governance.privacyIntegrity.checkDifferentialPrivacyGuarantee({
  probOutputGivenD: 0.01, probOutputGivenDPrime: 0.02, epsilon: 2, delta: 1e-5,
});
check("privacy.dp.holds", dp.holds, true);
check("privacy.dp.bound", dp.bound, 0.147791122);
check("privacy.dp.observed", dp.observed, 0.01);
check("privacy.composite", lm.governance.privacyIntegrity.calculateCompositePrivacyIntegrity({
  leakageScore: 0.998, membershipInferenceAdvantage: 0.1, epsilon: 2, epsilonTarget: 4, wLeak: 0.6, wMIA: 0.2, wDP: 0.2,
}), 0.9788);

/* ── Governance: bias index ───────────────────────────────────────────────── */
check("biasIndex.dir", lm.governance.biasIndex.calculateDIR(0.72, 0.9), 0.8);
check("biasIndex.dpd", lm.governance.biasIndex.calculateDemographicParityDifference(0.72, 0.9), 0.18);
check("biasIndex.cosine", lm.governance.biasIndex.cosineSimilarity([1, 0], [0, 1]), 0);
check("biasIndex.skew", lm.governance.biasIndex.calculateEmbeddingCosineSkew(
  [1, 0], [[1, 0], [0.9, 0.1]], [[0, 1], [0.1, 0.9]]), 1.9931388361);
check("biasIndex.composite", lm.governance.biasIndex.calculateCompositeBiasIndex({
  disparateImpactRatio: 0.8, demographicParityDifference: 0.18, embeddingCosineSkew: 0.5, w1: 0.4, w2: 0.3, w3: 0.3,
}), 0.284);

/* ── Governance: provenance completeness ──────────────────────────────────── */
check("provenance.base", lm.governance.provenanceCompleteness.calculateBaseProvenanceScore([1, 1, 0, 1]), 0.75);
check("provenance.completeness", lm.governance.provenanceCompleteness.calculateProvenanceCompletenessScore({
  entailmentIndicators: [1, 1, 0, 1], citationIndicators: [1, 1, 1, 1], alpha: 0.5,
}), 0.75);

/* ── Governance: auditability level ───────────────────────────────────────── */
const audEntries = ["run1", "run2", "run3"];
const audChain = lm.governance.auditabilityLevel.generateHashChain(audEntries);
check("auditability.logFields", lm.governance.auditabilityLevel.calculateLogFieldCompleteness([
  [1, 1, 1], [1, 1, 1], [1, 1, 1],
]), 1);
check("auditability.chain0", audChain[0], "c84c081932a90a5ea010af70f2b9895a54c2c032250f4adc896d3fa637797087");
check("auditability.ledger", lm.governance.auditabilityLevel.calculateLedgerIntegrity(audEntries, audChain), 1);
check("auditability.ledgerTampered", lm.governance.auditabilityLevel.calculateLedgerIntegrity(
  ["run1", "run2", "tampered"], audChain), 0.6666666667);
check("auditability.replay", lm.governance.auditabilityLevel.calculateReplayEquivalence([1, 0.95, 0.9]), 0.95);
check("auditability.composite", lm.governance.auditabilityLevel.calculateCompositeAuditability({
  logFieldCompleteness: 1, ledgerIntegrity: 1, replayEquivalence: 0.95, w1: 0.4, w2: 0.3, w3: 0.3,
}), 0.9847298018);

/* ── Governance: compliance adaptability ──────────────────────────────────── */
check("compliance.decoupling", lm.governance.complianceAdaptability.calculatePolicyDecouplingRatio(8, 2), 0.8);
check("compliance.latency", lm.governance.complianceAdaptability.calculatePolicyPropagationLatencyScore(2, 4), 1);
check("compliance.unlearning", lm.governance.complianceAdaptability.calculateUnlearningEfficiency({
  unlearningCompleteness: 0.95, selectiveUnlearnCost: 10, fullRetrainingCost: 100,
}), 0.855);
check("compliance.composite", lm.governance.complianceAdaptability.calculateCompositeComplianceAdaptability({
  policyDecouplingRatio: 0.8, policyPropagationLatencyScore: 1, unlearningEfficiency: 0.855, w1: 0.4, w2: 0.3, w3: 0.3,
}), 0.8689024390);

/* ── Safety ───────────────────────────────────────────────────────────────── */
check("safety.truthfulQA", lm.safety.truthfulQA.calculateTruthfulQA(92, 100), 0.92);
check("safety.asr.count", lm.safety.attackSuccessRate.countSuccessfulAttacks([true, false, true, false, false]), 2);
check("safety.asr.rate", lm.safety.attackSuccessRate.calculateAttackSuccessRate(8, 100), 0.08);
check("safety.asr.class", lm.safety.attackSuccessRate.classifyAttackSuccessRate(0.08), "Good");
check("safety.asr.class.high", lm.safety.attackSuccessRate.classifyAttackSuccessRate(0.5), "High Risk");
checkThrows("safety.asr.throws", () => lm.safety.attackSuccessRate.calculateAttackSuccessRate(5, 0));

/* ── Drift ────────────────────────────────────────────────────────────────── */
check("drift.data.psi", lm.drift.dataDrift.calculateDataDrift([0.5, 0.3, 0.2], [0.4, 0.35, 0.25]), 0.0411790667);
check("drift.data.class", lm.drift.dataDrift.classifyDataDrift(0.0411790667), "No Drift");
check("drift.model.pct", lm.drift.modelDrift.calculateModelDrift(0.95, 0.89), 6.3157894737);
check("drift.model.class", lm.drift.modelDrift.classifyModelDrift(6.3157894737), "Moderate Drift");
check("drift.model.improved", lm.drift.modelDrift.classifyModelDrift(-8.2352941176), "Performance Improved");
check("drift.model.zeroBaseline", lm.drift.modelDrift.calculateModelDrift(0, 0.5), 0);
check("drift.model.zeroBaseline.class", lm.drift.modelDrift.classifyModelDrift(0), "No Significant Drift");
check("drift.model.nan", lm.drift.modelDrift.classifyModelDrift(NaN), "Unknown");
checkThrows("drift.model.throws", () => lm.drift.modelDrift.calculateModelDrift("x", 1));
const custom = lm.drift.customDrift.evaluateCustomDrift([0.5, 0.3, 0.2], [0.45, 0.32, 0.23]);
check("drift.custom.score", custom.score, 0.0107516545);
check("drift.custom.class", custom.classification, "Low Drift");

/* ── Dataset evaluator ────────────────────────────────────────────────────── */
const qa = lm.dataset.evaluator.evaluateDataset(QA_ROWS);
check("dataset.row1.exactMatch", qa.rows[0].metrics.exactMatch, 1);
check("dataset.row1.tokenF1", qa.rows[0].metrics.tokenF1, 1);
check("dataset.row1.rouge1", qa.rows[0].metrics.rouge1, 0.75);
check("dataset.row1.rouge2", qa.rows[0].metrics.rouge2, 0.6667);
check("dataset.row1.rougeL", qa.rows[0].metrics.rougeL, 0.75);
check("dataset.row1.rc", qa.rows[0].metrics.rc, 1);
check("dataset.row1.perplexity", qa.rows[0].metrics.perplexity, 7.6666351582);
check("dataset.row3.exactMatch", qa.rows[2].metrics.exactMatch, 0);
check("dataset.row3.rouge1", qa.rows[2].metrics.rouge1, 0.1818);
check("dataset.row3.perplexity", qa.rows[2].metrics.perplexity, 907.5931475575);
check("dataset.agg.exactMatch.mean", qa.aggregates.exactMatch.mean, 0.6667);
check("dataset.agg.exactMatch.median", qa.aggregates.exactMatch.median, 1);
check("dataset.agg.perplexity.mean", qa.aggregates.perplexity.mean, 307.6797);
check("dataset.agg.perplexity.p90", qa.aggregates.perplexity.p90, 727.6304);
check("dataset.byLabel.Accurate.rouge1", qa.byLabel.Accurate.means.rouge1, 0.75);
check("dataset.byLabel.Inaccurate.perplexity", qa.byLabel.Inaccurate.means.perplexity, 907.5931);

/* ── High-level index wrappers ────────────────────────────────────────────── */
check("wrapper.biasMitigation", lm.evaluateBiasMitigation({
  biasMitigation: { biasRaw: 0.3, biasMitigated: 0.1, utilityRaw: 0.8, utilityMitigated: 0.75 },
}), 0.625);
check("wrapper.provenance", lm.evaluateProvenanceCompleteness({
  provenance: { entailment: [1, 1, 0, 1], citations: [1, 1, 1, 1], alpha: 0.5 },
}), 0.75);
check("wrapper.privacy", lm.evaluatePrivacyIntegrity({
  privacy: { unmaskedTokens: 1, totalTokens: 500, successfulAttacks: 0, totalAttacks: 100, miaAccuracy: 0.55, epsilon: 2, epsilonTarget: 4, wLeak: 0.6, wMIA: 0.2, wDP: 0.2 },
}), 0.97928);
check("wrapper.auditability", lm.evaluateAuditability({
  auditability: { logFieldMatrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], logEntries: ["run1", "run2", "run3"], replayScores: [1, 0.95, 0.9], w: [0.4, 0.3, 0.3] },
}), 0.9847298018);
check("wrapper.compliance", lm.evaluateComplianceAdaptability({
  compliance: { decoupled: 8, weightEmbedded: 2, actualTime: 2, slaTime: 4, unlearningCompleteness: 0.95, selectiveCost: 10, fullCost: 100, w: [0.4, 0.3, 0.3] },
}), 0.8689024390);
check("wrapper.biasIndex", lm.evaluateBiasIndex({
  biasIndex: { dirUnpriv: 0.72, dirPriv: 0.9, embTarget: [1, 0], embSetA: [[1, 0], [0.9, 0.1]], embSetB: [[0, 1], [0.1, 0.9]], w: [0.4, 0.3, 0.3] },
}), 0.7319416508);

/* ── Summary + golden-file support ────────────────────────────────────────── */
const summary = `Summary: ${passed} passed, ${failed} failed`;
lines.push(summary);
console.log(summary);

const args = process.argv.slice(2);
if (args.includes("--golden")) {
  fs.writeFileSync(GOLDEN_FILE, lines.join("\n") + "\n");
  console.log(`Golden written to ${GOLDEN_FILE}`);
  process.exit(0);
}
if (args.includes("--check-golden")) {
  const norm = (s) => s.replace(/\r\n/g, "\n").trim();
  const golden = norm(fs.readFileSync(GOLDEN_FILE, "utf8"));
  const current = norm(lines.join("\n"));
  if (golden === current) {
    console.log("Golden output matches.");
  } else {
    console.log("Golden output MISMATCH — recalculate goldens with --golden after verifying the change.");
    process.exitCode = 1;
  }
}
if (failed > 0) process.exitCode = 1;
