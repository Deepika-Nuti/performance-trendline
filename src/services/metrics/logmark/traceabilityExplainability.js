/**
 * ============================================================================
 * TRACEABILITY & EXPLAINABILITY (TE)
 * ----------------------------------------------------------------------------
 * Fraction of reasoning steps that carry a justification or cited source.
 *
 * Formula:
 *     TE = (steps that cite a source / explain reasoning) / (total steps)
 *
 * A step is "justified" when the model explains WHY it made that claim
 * (e.g. it names a source), so the step is not a black box.
 *
 * Interpretation:
 *     - 1.0 = every step is explained; no black-box steps.
 *     - 0.0 = no step comes with any justification.
 * ============================================================================
 */

/** TE = share of steps that carry a justification / source. */
function calculateTE(steps) {
  if (steps.length === 0) return 1;
  return steps.filter((s) => s.hasJustification).length / steps.length;
}

module.exports = { calculateTE };
