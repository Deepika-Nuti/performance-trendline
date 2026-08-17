/**
 * ============================================================================
 * AVERAGE ODDS DIFFERENCE (AOD)
 * ----------------------------------------------------------------------------
 * Group fairness metric. Averages the false-positive-rate difference and the
 * true-positive-rate difference between an unprivileged and a privileged group.
 *
 * Formula (matches IBM AIF360 `average_odds_difference`):
 *     AOD = 0.5 x [ (FPR_u - FPR_p) + (TPR_u - TPR_p) ]
 *
 * TPR = TP / (TP + FN); FPR = FP / (FP + TN).
 *
 * Interpretation:
 *     - 0  = the two groups have identical error patterns (equality of odds).
 *     - The sign shows the direction of the combined TPR+FPR imbalance.
 * ============================================================================
 */

/** AOD = average of the TPR difference and the FPR difference between groups. */
function calculateAOD(uTP, uFP, uTN, uFN, pTP, pFP, pTN, pFN) {
  const tprU = uTP / (uTP + uFN), fprU = uFP / (uFP + uTN);
  const tprP = pTP / (pTP + pFN), fprP = pFP / (pFP + pTN);
  return 0.5 * ((fprU - fprP) + (tprU - tprP));
}

module.exports = { calculateAOD };
