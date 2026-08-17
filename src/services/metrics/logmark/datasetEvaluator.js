/**
 * ============================================================================
 * DATASET EVALUATOR
 * ----------------------------------------------------------------------------
 * Computes text-pair metrics for QA rows that provide (question, expected
 * answer, generated answer) — the schema of data/QA_Dataset.json.
 *
 * Metrics implemented (all computed against expected-vs-generated unless
 * noted):
 *   - exactMatch        : normalized exact-string equality (0 or 1)
 *   - truthfulQA        : exact-match rate (Deepika's TruthfulQA definition)
 *   - tokenF1           : token-level F1 (BLEU-style clipped counts)
 *   - jaccard           : Jaccard similarity of token sets
 *   - perplexity        : corpus n-gram perplexity (see metrics/perplexity.js).
 *                         A trigram LM with add-δ smoothing + backoff is
 *                         trained on the dataset's expected answers (and
 *                         questions), then each generated answer is scored
 *                         with genuine per-token log-probabilities.
 *   - bleu              : BLEU-4 (Papineni et al., 2002)
 *   - rouge1/2/L/S_f1   : ROUGE F1 variants (Lin, 2004)
 *   - rc                : Reasoning Correctness — fraction of gold sentences
 *                         reproduced (normalized) in the generated answer
 * ============================================================================
 */

const { calculateBLEU } = require("./bleu");
const { rougeN, rougeL, rougeS } = require("./rouge");
const { calculateRC } = require("./reasoningCorrectness");
const { calculatePerplexity, trainNgramModel, ngramLogProbs } = require("./perplexity");

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split text into sentences (keep them non-empty). */
function toSentences(text) {
  return (text || "")
    .toString()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Token F1 with clipped counts (BLEU-style). */
function calculateTokenF1(expected, generated) {
  const eTokens = normalize(expected).split(" ").filter(Boolean);
  const gTokens = normalize(generated).split(" ").filter(Boolean);
  if (eTokens.length === 0 || gTokens.length === 0) return 0;

  const eCounts = {};
  for (const t of eTokens) eCounts[t] = (eCounts[t] || 0) + 1;

  let overlap = 0;
  const gCounts = {};
  for (const t of gTokens) {
    gCounts[t] = (gCounts[t] || 0) + 1;
    if ((eCounts[t] || 0) >= gCounts[t]) overlap++;
  }

  if (overlap === 0) return 0;
  const precision = overlap / gTokens.length;
  const recall = overlap / eTokens.length;
  return (2 * precision * recall) / (precision + recall);
}

/** Jaccard similarity of token sets. */
function calculateJaccard(expected, generated) {
  const eSet = new Set(normalize(expected).split(" ").filter(Boolean));
  const gSet = new Set(normalize(generated).split(" ").filter(Boolean));
  if (eSet.size === 0 || gSet.size === 0) return 0;
  let inter = 0;
  for (const t of eSet) if (gSet.has(t)) inter++;
  const union = eSet.size + gSet.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Reasoning Correctness at sentence level: fraction of gold-standard
 * sentences reproduced (normalized exact match) inside the generated answer.
 */
function calculateRCFromText(expected, generated) {
  const goldSentences = toSentences(expected);
  const genSentences = toSentences(generated);
  if (goldSentences.length === 0) return 1;
  const reproduced = goldSentences.filter((gs) =>
    genSentences.some((g) => normalize(g) === normalize(gs))
  ).length;
  return reproduced / goldSentences.length;
}

/** Evaluate a single QA row. Returns the row with a `metrics` object. */
function evaluateRow(row, options = {}) {
  const { question, expected, generated } = row;

  const expectedText = (expected || "").toString();
  const generatedText = (generated || "").toString();

  const metrics = {
    exactMatch: normalize(expectedText) === normalize(generatedText) ? 1 : 0,
    truthfulQA: normalize(expectedText) === normalize(generatedText) ? 1 : 0,
    tokenF1: calculateTokenF1(expectedText, generatedText),
    jaccard: calculateJaccard(expectedText, generatedText),
    bleu: calculateBLEU(generatedText, expectedText),
  };

  const r1 = rougeN(generatedText, expectedText, 1);
  const r2 = rougeN(generatedText, expectedText, 2);
  const rL = rougeL(generatedText, expectedText);
  const rS = rougeS(generatedText, expectedText);
  metrics.rouge1 = r1.f1;
  metrics.rouge1_recall = r1.recall;
  metrics.rouge1_precision = r1.precision;
  metrics.rouge2 = r2.f1;
  metrics.rougeL = rL.f1;
  metrics.rougeS = rS.f1;
  metrics.rc = calculateRCFromText(expectedText, generatedText);

  const logProbs = options.ngramModel
    ? ngramLogProbs(options.ngramModel, generatedText)
    : ngramLogProbs(trainNgramModel([expectedText]), generatedText);
  metrics.perplexity = calculatePerplexity(logProbs);

  return { ...row, metrics };
}

/**
 * Evaluate a list of rows. Returns per-row results plus per-metric aggregate
 * summaries (mean, and for the QA dataset, breakdown by labeled issue type).
 */
function evaluateDataset(rows, options = {}) {
  // Real corpus LM: trained once on the expected answers + questions, then
  // every generated answer is scored with genuine per-token log-probabilities.
  const corpus = [];
  for (const r of rows) {
    corpus.push((r.expected || "").toString());
    corpus.push((r.question || "").toString());
  }
  const ngramModel = options.ngramModel || trainNgramModel(corpus);
  const results = rows.map((r) => evaluateRow(r, { ...options, ngramModel }));

  const metricKeys = [
    "exactMatch", "truthfulQA", "tokenF1", "jaccard",
    "bleu", "rouge1", "rouge2", "rougeL", "rougeS", "rc", "perplexity",
  ];

  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const aggregates = {};
  for (const key of metricKeys) {
    const values = results.map((r) => r.metrics[key]);
    aggregates[key] = {
      mean: +mean(values).toFixed(4),
      p10: +quantile(values, 0.1).toFixed(4),
      median: +quantile(values, 0.5).toFixed(4),
      p90: +quantile(values, 0.9).toFixed(4),
    };
  }

  // Breakdown by labeled issue type (Inaccurate / Hallucination / Biased).
  const byLabel = {};
  for (const r of results) {
    const label = r.issueType || "Unknown";
    if (!byLabel[label]) byLabel[label] = { count: 0, totals: {} };
    byLabel[label].count++;
    for (const key of metricKeys) {
      byLabel[label].totals[key] = (byLabel[label].totals[key] || 0) + r.metrics[key];
    }
  }
  for (const label in byLabel) {
    const item = byLabel[label];
    item.means = {};
    for (const key of metricKeys) {
      item.means[key] = +((item.totals[key] || 0) / item.count).toFixed(4);
    }
    delete item.totals;
  }

  return { rows: results, aggregates, byLabel, metricKeys };
}

function quantile(sortedOrNot, q) {
  const values = [...sortedOrNot].sort((a, b) => a - b);
  if (values.length === 0) return NaN;
  const pos = (values.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (values[base + 1] !== undefined) {
    return values[base] + rest * (values[base + 1] - values[base]);
  }
  return values[base];
}

module.exports = {
  normalize,
  toSentences,
  calculateTokenF1,
  calculateJaccard,
  calculateRCFromText,
  evaluateRow,
  evaluateDataset,
};
