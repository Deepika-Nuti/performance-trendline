/**
 * ============================================================================
 * PROVENANCE COMPLETENESS
 * ----------------------------------------------------------------------------
 * Quantifies the traceability and semantic alignment of generated text against
 * retrieved source context (claim grounding, citation lineage).
 * Reference: Min et al. (2023) FActScore, arXiv:2305.14251;
 *            Es et al. (2024) RAGAS, EACL 2024 (Faithfulness metric).
 * ============================================================================
 */
/** Base Provenance Score = ( ╬ú v(c_i, C) ) / N
 * The RAGAS Faithfulness score: the fraction of atomic claims in a response
 * that are entailed by the retrieved context.
 * @param {number[]} entailmentIndicators - array of v(c_i, C) values, one per
 *        atomic claim, each 1 if entailed by context C, else 0
 * @returns {number} base provenance score, in [0,1]
 */
function calculateBaseProvenanceScore(entailmentIndicators) {
  const N = entailmentIndicators.length;
  if (N === 0) {
    throw new Error("entailmentIndicators must contain at least one claim");
  }
  const entailedCount = entailmentIndicators.reduce((sum, v) => sum + v, 0);
  return entailedCount / N;
}

/** Citation Integrity Adjustment: complete Provenance Completeness Score
 * PC = P_base ├ù ( ╬ú L(c_i) / N )^╬▒
 * where L(c_i) indicates whether claim c_i is bound to a valid citation anchor,
 * and ╬▒ Γêê [0,1] scales the penalty for uncited claims
 * (╬▒=0 ΓåÆ pure grounding; ╬▒=1 ΓåÆ strict citation mapping).
 * @param {object} input
 * @param {number[]} input.entailmentIndicators - v(c_i, C) values, one per claim
 * @param {number[]} input.citationIndicators - L(c_i) values, one per claim
 *        (must be the same length and order as entailmentIndicators)
 * @param {number} input.alpha - citation-penalty exponent, in [0,1]
 * @returns {number} provenance completeness score (PC), in [0,1]
 */
function calculateProvenanceCompletenessScore({ entailmentIndicators, citationIndicators, alpha }) {
  if (entailmentIndicators.length !== citationIndicators.length) {
    throw new Error("entailmentIndicators and citationIndicators must be the same length");
  }
  const N = citationIndicators.length;
  if (N === 0) {
    throw new Error("citationIndicators must contain at least one claim");
  }
  const baseProvenanceScore = calculateBaseProvenanceScore(entailmentIndicators);
  const citationRatio = citationIndicators.reduce((sum, v) => sum + v, 0) / N;
  return baseProvenanceScore * Math.pow(citationRatio, alpha);
}

module.exports = {
  calculateBaseProvenanceScore,
  calculateProvenanceCompletenessScore,
};
