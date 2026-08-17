/**
 * ============================================================================
 * PERPLEXITY
 * ----------------------------------------------------------------------------
 * How "surprised" (unsure) a language model is about the words it generates.
 * Lower (closer to 1) = the model predicted the words confidently; higher =
 * the model was guessing.
 *
 * Formula (canonical, see Hugging Face transformers docs):
 *     PPL = exp( - (1/N) * sum of per-token log-probabilities )
 *
 * N = number of tokens, log-prob = natural log of the probability the model
 * assigned to each token. -mean(log-prob) is the cross-entropy; exp() converts
 * it back into a "how surprised" number.
 *
 * REAL implementation: log-probabilities come from a trigram language model
 * with add-δ smoothing and backoff, trained on the actual dataset corpus.
 * `trainNgramModel` fits the model from real text; `ngramLogProbs` returns
 * genuine per-token log-probabilities for any other text. No fabricated
 * numbers — perplexity is a real cross-entropy estimate from observed data.
 *
 * `simulateLogProbs` is retained only for backward compatibility; it is no
 * longer used by the dashboard.
 * ============================================================================
 */

/** Turn free text into a list of lowercase word tokens. */
function tokenize(text) {
  return (text || "").toLowerCase().split(/\s+/).filter(Boolean);
}

/** Compute PPL = exp( -mean(log-probabilities) ).
 *  Returns NaN if there are no log-probabilities at all (empty input).
 */
function calculatePerplexity(logProbabilities) {
  const N = logProbabilities.length;
  if (N === 0) return NaN;

  const sumLogProbs = logProbabilities.reduce((sum, lp) => sum + lp, 0);
  return Math.exp(-sumLogProbs / N);
}

const SEP = "\u0001";

/** Train a trigram LM (add-δ smoothing, backoff) on a corpus of real text.
 *  @param {string[]} texts - the corpus documents
 *  @param {{n?:number, delta?:number}} [options]
 *  @returns {object} the fitted model
 */
function trainNgramModel(texts, options = {}) {
  const delta = options.delta ?? 0.01;
  const unigrams = new Map();
  const bigrams = new Map();
  const trigrams = new Map();
  const push = (map, key) => map.set(key, (map.get(key) || 0) + 1);

  let tokens = 0;
  for (const text of texts) {
    const toks = tokenize(text);
    tokens += toks.length;
    for (const t of toks) push(unigrams, t);
    for (let i = 1; i < toks.length; i++) push(bigrams, toks[i - 1] + SEP + toks[i]);
    for (let i = 2; i < toks.length; i++) push(trigrams, toks[i - 2] + SEP + toks[i - 1] + SEP + toks[i]);
  }

  return { unigrams, bigrams, trigrams, V: unigrams.size, delta, SEP, tokens };
}

/** Real per-token log-probabilities of `text` under the fitted model.
 *  P(w3|w1,w2) with trigram → bigram → unigram backoff and add-δ smoothing.
 *  @param {object} model - from trainNgramModel
 *  @param {string} text - the generated text to score
 *  @returns {number[]} per-token natural-log probabilities
 */
function ngramLogProbs(model, text) {
  const toks = tokenize(text);
  if (toks.length === 0) return [];

  const { unigrams, bigrams, trigrams, V, delta, tokens } = model;
  const smooth = (count, denom) => (count + delta) / (denom + delta * V);
  const out = [];

  for (let i = 0; i < toks.length; i++) {
    const w = toks[i];
    const w0 = i - 1 >= 0 ? toks[i - 1] : null;
    const w1 = i - 2 >= 0 ? toks[i - 2] : null;
    const cU = unigrams.get(w) || 0;

    let prob;
    if (w1 !== null) {
      const cTri = trigrams.get(w1 + SEP + w0 + SEP + w) || 0;
      const cBiCtx = bigrams.get(w1 + SEP + w0) || 0;
      if (cBiCtx > 0) {
        prob = smooth(cTri, cBiCtx);
      } else {
        const cBi = bigrams.get(w0 + SEP + w) || 0;
        const cU0 = unigrams.get(w0) || 0;
        prob = cU0 > 0 ? smooth(cBi, cU0) : smooth(cU, tokens);
      }
    } else if (w0 !== null) {
      const cBi = bigrams.get(w0 + SEP + w) || 0;
      const cU0 = unigrams.get(w0) || 0;
      prob = cU0 > 0 ? smooth(cBi, cU0) : smooth(cU, tokens);
    } else {
      prob = smooth(cU, tokens);
    }

    out.push(Math.log(Math.max(prob, 1e-15)));
  }
  return out;
}

/** Legacy estimate kept for backward compatibility (unused by the dashboard). */
function simulateLogProbs(goldStandard, llmOutput) {
  const goldTokens = new Set(tokenize(goldStandard));
  return tokenize(llmOutput).map((tok) => (goldTokens.has(tok) ? -0.2 : -2.5));
}

module.exports = { tokenize, calculatePerplexity, trainNgramModel, ngramLogProbs, simulateLogProbs };
