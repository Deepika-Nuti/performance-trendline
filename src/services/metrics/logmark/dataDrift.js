/**
 * ============================================================================
 * DATA DRIFT
 * ----------------------------------------------------------------------------
 * Measures changes in the statistical distribution of input data over time.
 * Data Drift occurs when the characteristics of incoming data differ from
 * the baseline data used during model training.
 *
 * This implementation uses Population Stability Index (PSI), one of the
 * most widely adopted statistical methods for detecting data drift.
 *
 * Formula:
 *      PSI = Σ((Actual - Expected) × ln(Actual / Expected))
 *
 * Reference:
 * ORQ.ai - Model Drift vs Data Drift
 * https://orq.ai/blog/model-vs-data-drift
 * ============================================================================
 */

/**
 * Calculates the Population Stability Index (PSI).
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
 * Population Stability Index (PSI).
 */
function calculatePSI(expectedDistribution, actualDistribution) {

  if (!Array.isArray(expectedDistribution) || !Array.isArray(actualDistribution)) {
    throw new Error("Inputs must be arrays.");
  }

  if (expectedDistribution.length !== actualDistribution.length) {
    throw new Error("Both distributions must have the same length.");
  }

  if (expectedDistribution.length === 0 || actualDistribution.length === 0) {
    throw new Error("Input arrays cannot be empty.");
  }

  let psi = 0;

  for (let i = 0; i < expectedDistribution.length; i++) {

    const expected = Math.max(expectedDistribution[i], 0.0001);
    const actual = Math.max(actualDistribution[i], 0.0001);

    psi += (actual - expected) * Math.log(actual / expected);
  }

  return psi;
}

/**
 * Calculates the Data Drift Score.
 *
 * This implementation uses Population Stability Index (PSI)
 * as the primary statistical method.
 *
 * @param {number[]} expectedDistribution
 * Baseline data distribution.
 *
 * @param {number[]} actualDistribution
 * Current data distribution.
 *
 * @returns {number}
 * Data Drift Score (PSI).
 */
function calculateDataDrift(expectedDistribution, actualDistribution) {

  return calculatePSI(expectedDistribution, actualDistribution);

}

/**
 * Classifies the level of Data Drift.
 *
 * Industry Standard Interpretation:
 *
 * PSI < 0.10      → No Drift
 * PSI < 0.25      → Moderate Drift
 * PSI ≥ 0.25      → Significant Drift
 *
 * @param {number} psi
 * Population Stability Index.
 *
 * @returns {string}
 * Drift classification.
 */
function classifyDataDrift(psi) {

  if (psi < 0.10) {
    return "No Drift";
  }

  if (psi < 0.25) {
    return "Moderate Drift";
  }

  return "Significant Drift";
}

module.exports = {
  calculatePSI,
  calculateDataDrift,
  classifyDataDrift,
};
