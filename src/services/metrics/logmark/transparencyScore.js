/**
 * ============================================================================
 * TRANSPARENCY SCORE (TS)
 * ----------------------------------------------------------------------------
 * Weighted average of transparency factors (data, model, decision,
 * limitation, governance transparency).
 *
 * Formula:
 *     TS = sum(score_i x weight_i) / sum(weight_i)
 *
 * Interpretation:
 *     - 0.8-1.0 = highly transparent.
 *     - < 0.5   = black box.
 * ============================================================================
 */

/** TS = weighted average of the factor scores. */
function calculateTS(factors) {
  if (factors.length === 0) return 0;

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return 0;

  return factors.reduce((s, f) => s + f.score * f.weight, 0) / totalWeight;
}

module.exports = { calculateTS };
