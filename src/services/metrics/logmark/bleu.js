/**
 * ============================================================================
 * BLEU (Bilingual Evaluation Understudy)
 * ----------------------------------------------------------------------------
 * Measures how much of the model's output word-for-word matches a human-written
 * reference (precision-oriented). Mainly used for translation / template
 * matching.
 *
 * Formula (Papineni et al., 2002 - ACL P02-1040; see NLTK / sacreBLEU):
 *     BLEU = BP * exp( average of log clipped-precision over 1..4-grams )
 *
 * - Precision is MODIFIED: an n-gram in the candidate only scores a match if
 *   the reference still has that n-gram available (prevents spam inflation).
 * - BP (brevity penalty) punishes outputs much shorter than the reference.
 * - Combining 1-grams .. 4-grams rewards both word choice and word order.
 *
 * Interpretation: 1.0 = identical wording; 0.0 = no overlapping phrases.
 * ============================================================================
 */

/** Turn free text into a list of lowercase word tokens. */
function tokenize(text) {
  return text.toLowerCase().split(/\s+/);
}

/** List every n-gram (window of n consecutive words) inside `tokens`. */
function getNGrams(tokens, n) {
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/** Count how many candidate n-grams also appear in the reference (clipped). */
function countMatches(candidateNGrams, referenceNGrams) {
  const refCounts = {};
  for (const ng of referenceNGrams) refCounts[ng] = (refCounts[ng] || 0) + 1;

  let matches = 0;
  const used = {};
  for (const ng of candidateNGrams) {
    if (!used[ng]) used[ng] = 0;
    if ((refCounts[ng] || 0) > used[ng]) {
      matches++;
      used[ng]++;
    }
  }
  return matches;
}

/** Compute the BLEU score for one candidate/reference pair. */
function calculateBLEU(candidate, reference) {
  const cTokens = tokenize(candidate), rTokens = tokenize(reference);
  const cLen = cTokens.length, rLen = rTokens.length;

  if (cLen === 0 || rLen === 0) return 0;

  let logAvg = 0, validN = 0;
  for (let n = 1; n <= 4; n++) {
    if (cLen < n || rLen < n) continue;

    const cNGrams = getNGrams(cTokens, n);
    const rNGrams = getNGrams(rTokens, n);
    const precision = countMatches(cNGrams, rNGrams) / cNGrams.length;

    if (precision === 0) return 0;

    logAvg += Math.log(precision);
    validN++;
  }

  logAvg /= validN;

  const bp = cLen >= rLen ? 1 : Math.exp(1 - rLen / cLen);
  return bp * Math.exp(logAvg);
}

module.exports = { tokenize, getNGrams, countMatches, calculateBLEU };
