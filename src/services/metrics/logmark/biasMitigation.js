/**
 * ============================================================================
 * BIAS MITIGATION
 * ----------------------------------------------------------------------------
 * Measures the delta improvement in bias after active interventions
 * (guardrails, in-processing constraints, output calibration), penalized
 * for any loss in downstream task accuracy.
 * Reference: Feldman et al. (2015) KDD; Hardt, Price & Srebro (2016) NeurIPS.
 * ============================================================================
 */

/** Disparate Impact Ratio = P(┼╢=1 | A=A0) / P(┼╢=1 | A=A1)
 * A DIR below 0.8 is generally treated as evidence of adverse impact
 * (EEOC "four-fifths rule", 29 CFR ┬º1607.4(D)).
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

/** Equalized Odds Variance = max( |TPR0-TPR1| , |FPR0-FPR1| )
 * Uses the Fairlearn convention (max of the two gaps), not the sum.
 * @param {object} rates
 * @param {number} rates.tprGroup0 - true positive rate, group A=0
 * @param {number} rates.tprGroup1 - true positive rate, group A=1
 * @param {number} rates.fprGroup0 - false positive rate, group A=0
 * @param {number} rates.fprGroup1 - false positive rate, group A=1
 * @returns {number} equalized odds variance, in [0,1]
 */
function calculateEqualizedOddsVariance({ tprGroup0, tprGroup1, fprGroup0, fprGroup1 }) {
  const tprGap = Math.abs(tprGroup0 - tprGroup1);
  const fprGap = Math.abs(fprGroup0 - fprGroup1);
  return Math.max(tprGap, fprGap);
}

/** Mitigation Efficacy Index = max( 0, (B_raw - B_mitigated) / B_raw )
 * Relative reduction in bias achieved by an intervention, clamped to zero
 * so a mitigation that makes bias worse never scores negative.
 * @param {number} biasRaw - baseline bias measured before mitigation (B_raw)
 * @param {number} biasMitigated - residual bias measured after mitigation
 * @returns {number} mitigation efficacy index, in [0,1]
 */
function calculateMitigationEfficacyIndex(biasRaw, biasMitigated) {
  // biasRaw === 0 means there was no bias to begin with ΓÇö a desirable state,
  // not an error. Efficacy is vacuously perfect (1.0), not undefined.
  if (biasRaw === 0) {
    return 1.0;
  }
  return Math.max(0, (biasRaw - biasMitigated) / biasRaw);
}

/** Utility-Weighted Mitigation Efficacy
 * M_E,weighted = M_E ├ù ( 1 - max(0, (U_raw - U_mitigated) / U_raw) )
 * Discounts the efficacy index by any relative drop in downstream task
 * utility, to block trivial "refuse everything" solutions from scoring well.
 * @param {number} mitigationEfficacyIndex - M_E, from calculateMitigationEfficacyIndex()
 * @param {number} utilityRaw - downstream task utility before mitigation (U_raw)
 * @param {number} utilityMitigated - downstream task utility after mitigation
 * @returns {number} utility-weighted mitigation efficacy index, in [0,1]
 */
function calculateUtilityWeightedEfficacy(mitigationEfficacyIndex, utilityRaw, utilityMitigated) {
  if (utilityRaw === 0) {
    throw new Error("utilityRaw must be non-zero");
  }
  const utilityPenalty = Math.max(0, (utilityRaw - utilityMitigated) / utilityRaw);
  return mitigationEfficacyIndex * (1 - utilityPenalty);
}

module.exports = {
  calculateDIR,
  calculateEqualizedOddsVariance,
  calculateMitigationEfficacyIndex,
  calculateUtilityWeightedEfficacy,
};
