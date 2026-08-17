/**
 * ============================================================================
 * STATISTICAL PARITY DIFFERENCE (SPD)
 * ----------------------------------------------------------------------------
 * Group fairness metric. Measures the gap in approval/selection rates between
 * an unprivileged and a privileged group.
 *
 * Formula (matches IBM AIF360 `statistical_parity_difference`):
 *     SPD = favor-rate(unprivileged) - favor-rate(privileged)
 *
 * favor-rate = fraction of each group that received the favorable outcome.
 *
 * Interpretation:
 *     - 0  = perfect parity (both groups treated the same).
 *     - <0 = unprivileged group is disadvantaged.
 *     - >0 = unprivileged group is advantaged.
 * ============================================================================
 */

/** SPD = selection rate of unprivileged group MINUS selection rate of privileged. */
function calculateSPD(unprivSelected, unprivTotal, privSelected, privTotal) {
  if (unprivTotal === 0 || privTotal === 0) {
    throw new Error("unprivTotal and privTotal must be non-zero");
  }
  return (unprivSelected / unprivTotal) - (privSelected / privTotal);
}

module.exports = { calculateSPD };
