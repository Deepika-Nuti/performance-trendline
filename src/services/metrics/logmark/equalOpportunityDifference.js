/**
 * ============================================================================
 * EQUAL OPPORTUNITY DIFFERENCE (EOD)
 * ----------------------------------------------------------------------------
 * Group fairness metric. Among qualified candidates, compares the true
 * positive rate across an unprivileged and a privileged group.
 *
 * Formula (matches IBM AIF360 `equal_opportunity_difference`, from
 * Hardt et al. 2016 "Equality of Opportunity in Supervised Learning"):
 *     EOD = TPR(unprivileged) - TPR(privileged)
 *
 * TPR = qualified people who WERE selected / all qualified people in the group.
 *
 * Interpretation:
 *     - 0  = perfect: qualified candidates in both groups selected equally.
 *     - <0 = qualified unprivileged candidates are being missed.
 *     - >0 = qualified unprivileged candidates are favored.
 * ============================================================================
 */

/** EOD = TPR(unprivileged) - TPR(privileged). */
function calculateEOD(unprivTP, unprivQual, privTP, privQual) {
  if (unprivQual === 0 || privQual === 0) {
    throw new Error("unprivQual and privQual must be non-zero");
  }
  return (unprivTP / unprivQual) - (privTP / privQual);
}

module.exports = { calculateEOD };
