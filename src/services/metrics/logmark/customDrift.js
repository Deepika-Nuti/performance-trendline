/**
 * ============================================================================
 * CUSTOM DRIFT
 * ----------------------------------------------------------------------------
 * Measures drift using a user-defined statistical method or custom business
 * logic. This allows organizations to implement domain-specific drift
 * detection strategies beyond standard techniques such as PSI.
 *
 * By default, this implementation demonstrates a PSI-based custom drift
 * calculation, but the scoring logic can be replaced with any custom method.
 *
 * Formula (Default):
 *      Custom Drift = Σ((Actual - Expected) × ln(Actual / Expected))
 *
 * Reference:
 * ORQ.ai - Model Drift vs Data Drift
 * https://orq.ai/blog/model-vs-data-drift
 * ============================================================================
 */

/**
 * Calculates a custom drift score using Population Stability Index (PSI).
 *
 * Organizations may replace this implementation with any
 * domain-specific statistical technique.
 *
 * Formula:
 *      PSI = Σ((Actual - Expected) × ln(Actual / Expected))
 *
 * @param {number[]} expectedDistribution
 * Baseline data distribution.
 *
 * @param {number[]} actualDistribution
 * Current data distribution.
 *
 * @returns {number}
 * Custom Drift Score.
 */
function calculateCustomDrift(expectedDistribution, actualDistribution) {

  if (!Array.isArray(expectedDistribution) || !Array.isArray(actualDistribution)) {
    throw new Error("Inputs must be arrays.");
  }

  if (expectedDistribution.length !== actualDistribution.length) {
    throw new Error("Both distributions must have the same length.");
  }

  let drift = 0;

  for (let i = 0; i < expectedDistribution.length; i++) {

    const expected = Math.max(expectedDistribution[i], 0.0001);
    const actual = Math.max(actualDistribution[i], 0.0001);

    drift += (actual - expected) * Math.log(actual / expected);
  }

  return drift;
}

/**
 * Classifies the Custom Drift score.
 *
 * Default Interpretation:
 *
 * Drift < 0.10      → Low Drift
 * Drift < 0.25      → Moderate Drift
 * Drift ≥ 0.25      → High Drift
 *
 * Thresholds may be customized depending on
 * organizational requirements.
 *
 * @param {number} driftScore
 * Custom Drift Score.
 *
 * @returns {string}
 * Drift classification.
 */
function classifyCustomDrift(driftScore) {

  if (driftScore < 0.10) {
    return "Low Drift";
  }

  if (driftScore < 0.25) {
    return "Moderate Drift";
  }

  return "High Drift";
}

/**
 * Returns both the calculated drift score and its classification.
 *
 * @param {number[]} expectedDistribution
 * Baseline data distribution.
 *
 * @param {number[]} actualDistribution
 * Current data distribution.
 *
 * @returns {{score:number, classification:string}}
 * Custom Drift evaluation.
 */
function evaluateCustomDrift(expectedDistribution, actualDistribution) {

  const score = calculateCustomDrift(
    expectedDistribution,
    actualDistribution
  );

  return {
    score,
    classification: classifyCustomDrift(score),
  };
}

module.exports = {
  calculateCustomDrift,
  classifyCustomDrift,
  evaluateCustomDrift,
};