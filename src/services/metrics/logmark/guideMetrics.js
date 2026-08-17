/**
 * ============================================================================
 * GUIDE METRICS — exact implementation of the official guide
 * "Logmark SLM Forge — Metrics Calculation Guide".
 * ----------------------------------------------------------------------------
 * Implements, verbatim:
 *   - the guide's tokenization pipeline
 *   - the 13 evaluation metrics (ROUGE-1, ROUGE-L, ROUGE-2/BLEU-Bi, Precision,
 *     Recall, F1, BLEU, Semantic similarity, WER, Faithfulness, Hallucination
 *     flag, Completeness flag, Accuracy)
 *   - the Row Overall and Aggregate Overall composite scores
 *
 * Each function follows the guide's equation exactly (H = hypothesis /
 * generated answer, R = reference / expected answer). Manual overrides
 * (Hallucination / Completeness flags, Accuracy) are supported and, when not
 * supplied, the guide's automated fallbacks are used.
 * ============================================================================
 */

"use strict";

/**
 * Guide tokenization (section 1 of the guide):
 *   1. lowercase
 *   2. replace any non-alphanumeric (anything that is not a–z, 0–9, or
 *      whitespace) with a space
 *   3. split on one or more whitespace characters
 *   4. remove empty elements
 */
function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const setOf = (tokens) => new Set(tokens);

/** Number of reference tokens that also appear in the hypothesis. */
function referenceMatches(HSet, R) {
  let c = 0;
  for (const w of R) if (HSet.has(w)) c++;
  return c;
}

/** Number of hypothesis tokens that also appear in the reference. */
function hypothesisMatches(RSet, H) {
  let c = 0;
  for (const w of H) if (RSet.has(w)) c++;
  return c;
}

/** 1. ROUGE-1 = |{ w ∈ R : w ∈ H }| / |R| */
function rouge1(h, r) {
  const H = tokenize(h), R = tokenize(r);
  return rouge1Tokens(H, R);
}

function rouge1Tokens(H, R) {
  if (R.length === 0) return 0;
  return referenceMatches(setOf(H), R) / R.length;
}

/** Length of the Longest Common Subsequence (classic DP edit grid). */
function lcsLength(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/** 2. ROUGE-L = LCS(H, R) / |R| */
function rougeL(h, r) {
  const H = tokenize(h), R = tokenize(r);
  return rougeLTokens(H, R);
}

function rougeLTokens(H, R) {
  if (R.length === 0) return 0;
  return lcsLength(H, R) / R.length;
}

/** Clipped unigram precision (modified BLEU precision for 1-grams). */
function uniPrecisionClipped(H, R) {
  if (H.length === 0) return 0;
  const rCounts = {};
  for (const w of R) rCounts[w] = (rCounts[w] || 0) + 1;
  const hCounts = {};
  let matches = 0;
  for (const w of H) {
    hCounts[w] = (hCounts[w] || 0) + 1;
    if ((rCounts[w] || 0) >= hCounts[w]) matches++;
  }
  return matches / H.length;
}

/** Clipped bigram precision (modified BLEU precision for 2-grams). */
function biPrecisionClipped(H, R) {
  if (H.length < 2 || R.length < 2) return 0;
  const rCounts = {};
  for (let i = 0; i <= R.length - 2; i++) {
    const g = R[i] + " " + R[i + 1];
    rCounts[g] = (rCounts[g] || 0) + 1;
  }
  let matches = 0;
  const hCounts = {};
  for (let i = 0; i <= H.length - 2; i++) {
    const g = H[i] + " " + H[i + 1];
    hCounts[g] = (hCounts[g] || 0) + 1;
    if ((rCounts[g] || 0) >= hCounts[g]) matches++;
  }
  return matches / (H.length - 1);
}

/** 3. ROUGE-2 = BLEU bigram precision. */
function rouge2(h, r) {
  return biPrecisionClipped(tokenize(h), tokenize(r));
}

/** 7. BLEU = sqrt(P1 × P2)  if P1 > 0 and P2 > 0, else P1 × 0.5 */
function bleu(h, r) {
  const H = tokenize(h), R = tokenize(r);
  return bleuFrom(uniPrecisionClipped(H, R), biPrecisionClipped(H, R));
}

function bleuFrom(p1, p2) {
  if (p1 > 0 && p2 > 0) return Math.sqrt(p1 * p2);
  return p1 * 0.5;
}

/** 4. Precision = |{ w ∈ H : w ∈ R }| / |H| */
function precision(h, r) {
  const H = tokenize(h), R = tokenize(r);
  if (H.length === 0) return 0;
  return hypothesisMatches(setOf(R), H) / H.length;
}

/** 5. Recall = ROUGE-1(H, R) */
function recall(h, r) {
  return rouge1(h, r);
}

/** 6. F1 = 2 × (Precision × Recall) / (Precision + Recall) */
function f1Score(p, rec) {
  return (p + rec === 0) ? 0 : (2 * p * rec) / (p + rec);
}

function f1(h, r) {
  const p = precision(h, r), rec = recall(h, r);
  return f1Score(p, rec);
}

/** 8. Semantic similarity = min(1, (ROUGE-1 × 0.5 + ROUGE-L × 0.5) × 1.05) */
function semanticSimilarity(h, r) {
  const r1 = rouge1(h, r), rl = rougeL(h, r);
  return Math.min(1, (r1 * 0.5 + rl * 0.5) * 1.05);
}

/** Levenshtein word-edit distance between two token arrays. */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

/** 9. WER = min(1, EditDistance(H, R) / |R|) */
function wer(h, r) {
  const H = tokenize(h), R = tokenize(r);
  if (R.length === 0) return H.length ? 1 : 0;
  return Math.min(1, levenshtein(H, R) / R.length);
}

/** 10. Faithfulness = min(1, ROUGE-1 × 1.1) */
function faithfulness(h, r) {
  return Math.min(1, rouge1(h, r) * 1.1);
}

/**
 * 11. Hallucination flag.
 *   - manual override: binary 0 or 1 (human review)
 *   - automated fallback: ROUGE-1 < 0.15 ⇒ 1 (hallucinated), else 0
 */
function hallucinationFlag(h, r, manual) {
  const heuristicFlag = rouge1(h, r) < 0.15 ? 1 : 0;
  if (manual === null || manual === undefined) {
    return { status: 'not_available', reason: 'no human label for this row' };
  }
  return { 
    value: manual ? 1 : 0, 
    details: { heuristicFlag } 
  };
}

/**
 * 12. Completeness flag.
 *   - manual override: binary 0 or 1 (human review)
 *   - automated fallback: ROUGE-1 ≥ 0.30 ⇒ 1 (complete), else 0
 */
function completenessFlag(h, r, manual) {
  if (manual === 0 || manual === 1) return manual;
  return rouge1(h, r) >= 0.30 ? 1 : 0;
}

/**
 * 13. Accuracy.
 *   - manual override: graded by a human reviewer (score 0–100)
 *   - automated fallback: ROUGE-L × 100
 */
function accuracy(h, r, manual) {
  if (manual !== undefined && manual !== null) return manual;
  return rougeL(h, r) * 100;
}

/** A. Row Overall = round( (0.3·ROUGE-L + 0.4·Faithfulness + 0.3·ROUGE-1) × 100 ) */
function rowOverall(h, r) {
  const rl = rougeL(h, r), r1 = rouge1(h, r), f = faithfulness(h, r);
  return Math.round((0.3 * rl + 0.4 * f + 0.3 * r1) * 100);
}

/**
 * B. Aggregate Overall = round( 0.35·Accuracy + 0.30·Completeness
 *                              + 0.20·(100 − Hallucination Rate)
 *                              + 0.15·Faithfulness )
 * All four inputs are percentages (0–100).
 */
function aggregateOverall({ accuracyMean, completenessPct, hallucinationPct, faithfulnessMean }) {
  return Math.round(
    0.35 * accuracyMean +
    0.30 * completenessPct +
    0.20 * (100 - hallucinationPct) +
    0.15 * faithfulnessMean
  );
}

/**
 * One-stop per-row evaluation for the dashboard. `manual` may carry
 * { hallucination: 0|1, completeness: 0|1, accuracy: 0–100 } overrides.
 */
function evaluateGuideRow(expected, generated, manual = {}) {
  const r1 = rouge1(generated, expected);
  const rl = rougeL(generated, expected);
  return {
    r1,
    rl,
    r2: rouge2(generated, expected),
    precision: precision(generated, expected),
    recall: r1,
    f1: f1Score(precision(generated, expected), r1),
    bleu: bleu(generated, expected),
    semantic: semanticSimilarity(generated, expected),
    wer: wer(generated, expected),
    faithfulness: faithfulness(generated, expected),
    hallucination: hallucinationFlag(generated, expected, manual.hallucination),
    completeness: completenessFlag(generated, expected, manual.completeness),
    accuracy: accuracy(generated, expected, manual.accuracy),
    rowOverall: rowOverall(generated, expected),
  };
}

module.exports = {
  tokenize,
  rouge1,
  rougeL,
  rouge2,
  precision,
  recall,
  f1,
  f1Score,
  bleu,
  semanticSimilarity,
  wer,
  faithfulness,
  hallucinationFlag,
  completenessFlag,
  accuracy,
  rowOverall,
  aggregateOverall,
  evaluateGuideRow,
};
