/**
 * ============================================================================
 * REASONING CORRECTNESS (RC)
 * ----------------------------------------------------------------------------
 * Fraction of gold-standard reasoning steps that the model reproduced
 * correctly (step-level recall of the gold reasoning chain).
 *
 * Formula:
 *     RC = (LLM reasoning steps that match the gold standard) / (gold steps)
 *
 * A step "matches" when its NORMALIZED text equals one of the normalized
 * gold-standard steps (normalize removes punctuation + case).
 *
 * Interpretation:
 *     - 1.0 = every gold step was reproduced correctly.
 *     - 0.0 = no gold step was reproduced.
 * ============================================================================
 */

/** Normalize a step: lowercase, replace non-alphanumeric runs with a space. */
function normalize(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** RC = fraction of gold steps that the LLM output reproduced correctly. */
function calculateRC(llmSteps, goldSteps) {
  const goldSet = new Set(goldSteps.map(normalize));
  const valid = llmSteps.filter((s) => goldSet.has(normalize(s))).length;
  return goldSteps.length === 0 ? 1 : valid / goldSteps.length;
}

module.exports = { normalize, calculateRC };
