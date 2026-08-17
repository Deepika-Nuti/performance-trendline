/**
 * ============================================================================
 * COMPLIANCE ADAPTABILITY SCORE
 * ----------------------------------------------------------------------------
 * Measures the speed, compute efficiency, and structural agility with which
 * an AI system incorporates new regulatory constraints, legal policies, or
 * organizational safety updates without requiring full model retraining.
 * Reference: GDPR Article 17 ("Right to be Forgotten");
 *            Bourtoule et al. (2021) IEEE S&P (Machine Unlearning).
 * ============================================================================
 */
/** Policy Decoupling Ratio
 * D_P = |R_decoupled| / ( |R_decoupled| + |R_weights| )
 * Proportion of active policy constraints that can be modified dynamically
 * (guardrails, vector-store purges, system prompts) without retraining weights.
 * @param {number} decoupledConstraintCount - |R_decoupled|
 * @param {number} weightEmbeddedConstraintCount - |R_weights|
 * @returns {number} policy decoupling ratio, in [0,1]
 */
function calculatePolicyDecouplingRatio(decoupledConstraintCount, weightEmbeddedConstraintCount) {
  const total = decoupledConstraintCount + weightEmbeddedConstraintCount;
  if (total === 0) {
    throw new Error("decoupledConstraintCount + weightEmbeddedConstraintCount must be non-zero");
  }
  return decoupledConstraintCount / total;
}

/** Policy Propagation Latency Score
 * S_latency = exp( -max(0, (╬öt_actual - ╬öt_SLA) / ╬öt_SLA) )
 * Equals 1.0 whenever the update lands within SLA; decays exponentially
 * the longer it overshoots.
 * @param {number} actualPropagationTime - ╬öt_actual, time taken to propagate the update
 * @param {number} slaPropagationTime - ╬öt_SLA, the targeted SLA time
 * @returns {number} policy propagation latency score, in (0,1]
 */
function calculatePolicyPropagationLatencyScore(actualPropagationTime, slaPropagationTime) {
  if (slaPropagationTime === 0) {
    throw new Error("slaPropagationTime must be non-zero");
  }
  const overshoot = Math.max(0, (actualPropagationTime - slaPropagationTime) / slaPropagationTime);
  return Math.exp(-overshoot);
}

/** Machine Unlearning Efficiency Index
 * C_ratio = 1.0 - min(1.0, Cost(Selective Unlearn) / Cost(Full Retraining))
 * E_unlearn = U_eff ├ù C_ratio
 * @param {object} input
 * @param {number} input.unlearningCompleteness - U_eff, in [0,1] (e.g. via
 *        membership inference attacks or influence-gradient reduction, confirming
 *        target records are neutralized)
 * @param {number} input.selectiveUnlearnCost - cost of the selective unlearn/vector purge
 * @param {number} input.fullRetrainingCost - cost of retraining the model from scratch
 * @returns {number} machine unlearning efficiency index, in [0,1]
 */
function calculateUnlearningEfficiency({ unlearningCompleteness, selectiveUnlearnCost, fullRetrainingCost }) {
  if (fullRetrainingCost === 0) {
    throw new Error("fullRetrainingCost must be non-zero");
  }
  const costRatio = 1.0 - Math.min(1.0, selectiveUnlearnCost / fullRetrainingCost);
  return unlearningCompleteness * costRatio;
}

/** Composite Compliance Adaptability Score (weighted harmonic mean)
 * C_A = (w1 + w2 + w3) / ( w1/D_P + w2/S_latency + w3/E_unlearn )
 * where w1 + w2 + w3 = 1.0. The harmonic mean is dominated by the smallest
 * input, so a single collapsed dimension (e.g. zero unlearning capability)
 * heavily penalizes the overall score ΓÇö an arithmetic mean would mask it.
 * @param {object} input
 * @param {number} input.policyDecouplingRatio - D_P, from calculatePolicyDecouplingRatio()
 * @param {number} input.policyPropagationLatencyScore - S_latency, from calculatePolicyPropagationLatencyScore()
 * @param {number} input.unlearningEfficiency - E_unlearn, from calculateUnlearningEfficiency()
 * @param {number} input.w1 - weight on policy decoupling
 * @param {number} input.w2 - weight on propagation latency
 * @param {number} input.w3 - weight on unlearning efficiency
 * @returns {number} composite compliance adaptability score, in [0,1]
 */
function calculateCompositeComplianceAdaptability({
  policyDecouplingRatio,
  policyPropagationLatencyScore,
  unlearningEfficiency,
  w1,
  w2,
  w3,
}) {
  if (Math.abs(w1 + w2 + w3 - 1.0) > 1e-9) {
    throw new Error("w1, w2 and w3 must sum to 1.0");
  }
  if (policyDecouplingRatio === 0 || policyPropagationLatencyScore === 0 || unlearningEfficiency === 0) {
    return 0; // harmonic mean is undefined/degenerate when any input is zero
  }
  const weightedReciprocalSum =
    w1 / policyDecouplingRatio + w2 / policyPropagationLatencyScore + w3 / unlearningEfficiency;
  return (w1 + w2 + w3) / weightedReciprocalSum;
}

module.exports = {
  calculatePolicyDecouplingRatio,
  calculatePolicyPropagationLatencyScore,
  calculateUnlearningEfficiency,
  calculateCompositeComplianceAdaptability,
};
