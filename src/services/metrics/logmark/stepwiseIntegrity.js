/**
 * ============================================================================
 * STEPWISE INTEGRITY (SI)
 * ----------------------------------------------------------------------------
 * Fraction of reasoning steps that are BOTH logically valid AND factually
 * correct.
 *
 * Formula:
 *     SI = (steps that are logically valid AND factually correct) / (total steps)
 *
 * Each step carries a string description plus two flags, assumed to be
 * produced by a human or an external judge. This module only does the
 * arithmetic.
 *
 * Interpretation:
 *     - 1.0 = every step is sound.
 *     - < 1 = some steps are logically flawed or hallucinated.
 * ============================================================================
 */

/** SI = share of steps that are BOTH logically valid AND factually correct. */
function calculateSI(steps) {
  if (steps.length === 0) return 1;
  return steps.filter((s) => s.logicallyValid && s.factuallyCorrect).length / steps.length;
}

module.exports = { calculateSI };
