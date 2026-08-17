/**
 * ============================================================================
 * ROUGE (Recall-Oriented Understudy for Gisting Evaluation)
 * ----------------------------------------------------------------------------
 * Measures how much of the reference content the model's output covered
 * (recall-oriented). Mainly used for summarisation / content coverage.
 *
 * Reference: Lin, "ROUGE: A Package for Automatic Evaluation of Summaries",
 * ACL Workshop 2004 (W04-1013) - same counting rules as py-rouge.
 *
 * - ROUGE-N: n-gram overlap expressed as recall / precision / F1
 * - ROUGE-L: Longest Common Subsequence (order matters, gaps allowed)
 * - ROUGE-S: skip-bigram pairs (any two tokens, first before second)
 *
 * IMPORTANT COUNTING RULE: matches are counted with MULTIPLICITY. If an
 * n-gram appears 3 times in the candidate but only 2 times in the reference,
 * it only counts as 2 matches. This mirrors official ROUGE behaviour.
 * ============================================================================
 */

/** Turn free text into a list of lowercase word tokens. */
function tokenize(text) {
  return text.toLowerCase().split(/\s+/);
}

/** Build a histogram: n-gram string -> how many times it occurs. */
function getNGramCounts(tokens, n) {
  const counts = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ');
    counts[gram] = (counts[gram] || 0) + 1;
  }
  return counts;
}

/** Number of overlapping n-grams, capped by how often each side has them. */
function countMatches(candidateCounts, referenceCounts) {
  let matches = 0;
  for (const gram in candidateCounts) {
    if (referenceCounts[gram]) matches += Math.min(candidateCounts[gram], referenceCounts[gram]);
  }
  return matches;
}

/** Total number of n-grams in a histogram (just add all the counts). */
function totalCounts(counts) {
  return Object.values(counts).reduce((sum, c) => sum + c, 0);
}

/** F1 = harmonic mean of precision and recall (0 if both are 0). */
function f1(p, r) {
  return (p + r === 0) ? 0 : 2 * p * r / (p + r);
}

/** ROUGE-N: n-gram recall / precision / F1 between candidate and reference. */
function rougeN(candidate, reference, n) {
  const cTokens = tokenize(candidate), rTokens = tokenize(reference);
  if (cTokens.length < n || rTokens.length < n) {
    return { recall: 0, precision: 0, f1: 0 };
  }

  const cCounts = getNGramCounts(cTokens, n);
  const rCounts = getNGramCounts(rTokens, n);

  const matches = countMatches(cCounts, rCounts);
  const recall = totalCounts(rCounts) ? matches / totalCounts(rCounts) : 0;
  const precision = totalCounts(cCounts) ? matches / totalCounts(cCounts) : 0;

  return { recall: +recall.toFixed(4), precision: +precision.toFixed(4), f1: +f1(precision, recall).toFixed(4) };
}

/** Length of the Longest Common Subsequence (classic DP).
 *  A subsequence keeps the order of tokens but may skip tokens in between.
 */
function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/** ROUGE-L: LCS-based recall / precision / F1. */
function rougeL(candidate, reference) {
  const cTokens = tokenize(candidate), rTokens = tokenize(reference);
  const lcs = longestCommonSubsequence(cTokens, rTokens);

  const recall = rTokens.length ? lcs / rTokens.length : 0;
  const precision = cTokens.length ? lcs / cTokens.length : 0;
  return { recall: +recall.toFixed(4), precision: +precision.toFixed(4), f1: +f1(precision, recall).toFixed(4) };
}

/** ROUGE-S: skip-bigram co-occurrence (any ordered pair, counted w/ multiplicity). */
function rougeS(candidate, reference) {
  const cTokens = tokenize(candidate), rTokens = tokenize(reference);
  const cSG = {}, rSG = {};

  for (let i = 0; i < cTokens.length; i++) {
    for (let j = i + 1; j < cTokens.length; j++) {
      const pair = `${cTokens[i]} ${cTokens[j]}`;
      cSG[pair] = (cSG[pair] || 0) + 1;
    }
  }
  for (let i = 0; i < rTokens.length; i++) {
    for (let j = i + 1; j < rTokens.length; j++) {
      const pair = `${rTokens[i]} ${rTokens[j]}`;
      rSG[pair] = (rSG[pair] || 0) + 1;
    }
  }

  const matches = countMatches(cSG, rSG);
  const recall = totalCounts(rSG) ? matches / totalCounts(rSG) : 0;
  const precision = totalCounts(cSG) ? matches / totalCounts(cSG) : 0;
  return { recall: +recall.toFixed(4), precision: +precision.toFixed(4), f1: +f1(precision, recall).toFixed(4) };
}

module.exports = { tokenize, rougeN, rougeL, rougeS, longestCommonSubsequence };
