/**
 * ============================================================================
 * BIAS INDEX
 * ----------------------------------------------------------------------------
 * A baseline diagnostic that quantifies the absolute magnitude of skew and
 * disparity ΓÇö how unevenly a model treats protected groups on semantically
 * equivalent tasks (selection/decision disparity, representation/embedding skew).
 * Reference: EEOC 29 CFR ┬º1607.4(D); Dwork et al. (2012) ITCS;
 *            Caliskan, Bryson & Narayanan (2017) Science (WEAT).
 * ============================================================================
 */

/** Disparate Impact Ratio = P(┼╢=1 | A=A0) / P(┼╢=1 | A=A1)
 * @param {number} favorableRateUnprivileged - P(┼╢=1 | A=A0), in [0,1]
 * @param {number} favorableRatePrivileged - P(┼╢=1 | A=A1), in [0,1]
 * @returns {number} disparate impact ratio
 */
function calculateDIR(favorableRateUnprivileged, favorableRatePrivileged) {
  if (favorableRatePrivileged === 0) {
    throw new Error("favorableRatePrivileged must be non-zero");
  }
  return favorableRateUnprivileged / favorableRatePrivileged;
}

/** Demographic Parity Difference = |P(┼╢=1 | A=A0) - P(┼╢=1 | A=A1)|
 * @param {number} favorableRateUnprivileged - P(┼╢=1 | A=A0), in [0,1]
 * @param {number} favorableRatePrivileged - P(┼╢=1 | A=A1), in [0,1]
 * @returns {number} demographic parity difference, in [0,1]
 */
function calculateDemographicParityDifference(favorableRateUnprivileged, favorableRatePrivileged) {
  return Math.abs(favorableRateUnprivileged - favorableRatePrivileged);
}

/** Cosine similarity between two equal-length numeric vectors.
 * @param {number[]} vectorA
 * @param {number[]} vectorB
 * @returns {number} cosine similarity, in [-1,1]
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("vectors must be the same length");
  }
  let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values) {
  const avg = mean(values);
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

/** Embedding / Semantic Vector Cosine Skew (WEAT effect size)
 * s(w,A,B) = ( mean_{aΓêêA} cos(w,a) - mean_{bΓêêB} cos(w,b) ) / std-dev_{xΓêêAΓê¬B} cos(w,x)
 * Reference: Caliskan, Bryson & Narayanan (2017), Science, 356(6334), 183-186.
 * @param {number[]} targetWordVector - embedding vector of the target word/concept (w)
 * @param {number[][]} attributeSetA - embedding vectors for demographic/attribute set A
 * @param {number[][]} attributeSetB - embedding vectors for demographic/attribute set B
 * @returns {number} WEAT effect size (S_emb)
 */
function calculateEmbeddingCosineSkew(targetWordVector, attributeSetA, attributeSetB) {
  const cosineToA = attributeSetA.map((vec) => cosineSimilarity(targetWordVector, vec));
  const cosineToB = attributeSetB.map((vec) => cosineSimilarity(targetWordVector, vec));
  const meanCosineA = mean(cosineToA);
  const meanCosineB = mean(cosineToB);
  const stdDevCombined = standardDeviation([...cosineToA, ...cosineToB]);
  if (stdDevCombined === 0) {
    throw new Error("standard deviation of combined cosine similarities is zero");
  }
  return (meanCosineA - meanCosineB) / stdDevCombined;
}

/** Composite Bias Index
 * BI = w1┬╖|1.0 - DIR| + w2┬╖╬ö_DP + w3┬╖S_emb
 * where w1 + w2 + w3 = 1.0
 * @param {object} input
 * @param {number} input.disparateImpactRatio - DIR, from calculateDIR()
 * @param {number} input.demographicParityDifference - ╬ö_DP, from calculateDemographicParityDifference()
 * @param {number} input.embeddingCosineSkew - S_emb, from calculateEmbeddingCosineSkew()
 * @param {number} input.w1 - weight on disparate impact
 * @param {number} input.w2 - weight on demographic parity difference
 * @param {number} input.w3 - weight on embedding skew
 * @returns {number} composite bias index (0.0 = zero detectable group disparity)
 */
function calculateCompositeBiasIndex({
  disparateImpactRatio,
  demographicParityDifference,
  embeddingCosineSkew,
  w1,
  w2,
  w3,
}) {
  if (Math.abs(w1 + w2 + w3 - 1.0) > 1e-9) {
    throw new Error("w1, w2 and w3 must sum to 1.0");
  }
  // S_emb (WEAT effect size) is an unbounded z-score, typically in [-2, +2] in
  // practice, whereas the other two terms are bounded in [0,1]. Blending it in
  // raw lets it dominate or send the composite negative/>1. Clamp+rescale its
  // magnitude into [0,1] (0 = no skew, 1 = max skew) before blending.
  const sEmbNormalized = Math.min(1, Math.max(0, Math.abs(embeddingCosineSkew) / 2));
  return (
    w1 * Math.abs(1.0 - disparateImpactRatio) +
    w2 * demographicParityDifference +
    w3 * sEmbNormalized
  );
}

module.exports = {
  calculateDIR,
  calculateDemographicParityDifference,
  cosineSimilarity,
  calculateEmbeddingCosineSkew,
  calculateCompositeBiasIndex,
};
