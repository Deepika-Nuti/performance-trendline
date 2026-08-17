/**
 * ============================================================================
 * MODEL DRIFT
 * ----------------------------------------------------------------------------
 * Measures the degradation in an AI model's performance over time.
 * Model Drift occurs when the model's predictive performance declines
 * because of changes in data patterns, user behavior, or the environment.
 *
 * This implementation measures Model Drift based on the percentage
 * decrease in a selected performance metric (e.g., Accuracy, F1-Score,
 * Precision, Recall).
 *
 * Formula:
 *      Model Drift = ((Baseline Performance - Current Performance)
 *                     / Baseline Performance) × 100
 *
 * Reference:
 * ORQ.ai - Model Drift vs Data Drift
 * https://orq.ai/blog/model-vs-data-drift
 * ============================================================================
 */

/**
 * Calculates the performance degradation.
 *
 * Formula:
 *      Performance Drop =
 *      Baseline Performance - Current Performance
 *
 * @param {number} baselinePerformance
 * Performance of the baseline model.
 *
 * @param {number} currentPerformance
 * Current model performance.
 *
 * @returns {number}
 * Absolute performance drop.
 */
function calculatePerformanceDrop(baselinePerformance, currentPerformance) {

  if (typeof baselinePerformance !== "number") {
    throw new Error("baselinePerformance must be a number.");
  }

  if (typeof currentPerformance !== "number") {
    throw new Error("currentPerformance must be a number.");
  }

  return baselinePerformance - currentPerformance;
}

/**
 * Calculates the Model Drift percentage.
 *
 * Formula:
 *      Model Drift =
 *      ((Baseline - Current) / Baseline) × 100
 *
 * @param {number} baselinePerformance
 * Performance of the baseline model.
 *
 * @param {number} currentPerformance
 * Performance of the current model.
 *
 * @returns {number}
 * Model Drift percentage.
 */
function calculateModelDrift(baselinePerformance, currentPerformance) {

  if (typeof baselinePerformance !== "number") {
    throw new Error("baselinePerformance must be a number.");
  }

  if (typeof currentPerformance !== "number") {
    throw new Error("currentPerformance must be a number.");
  }

  // Return the simple drift formula (positive = degradation)
  return calculatePerformanceDrop(
    baselinePerformance,
    currentPerformance
  );
}

/**
 * Classifies the level of Model Drift.
 *
 * Industry Interpretation:
 *
 * Drift < 5%      → No Significant Drift
 * Drift < 10%     → Moderate Drift
 * Drift ≥ 10%     → Significant Drift
 *
 * @param {number} driftPercentage
 * Model Drift percentage.
 *
 * @returns {string}
 * Drift classification.
 */
function classifyModelDrift(driftPercentage) {

  if (isNaN(driftPercentage)) {
    return "Unknown";
  }

  if (driftPercentage < 0) {
    return "Performance Improved";
  }

  if (driftPercentage < 5) {
    return "No Significant Drift";
  }

  if (driftPercentage < 10) {
    return "Moderate Drift";
  }

  return "Significant Drift";
}

module.exports = {
  calculatePerformanceDrop,
  calculateModelDrift,
  classifyModelDrift,
};