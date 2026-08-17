/**
 * ============================================================================
 * DISPARATE IMPACT (DI)
 * ----------------------------------------------------------------------------
 * Group fairness metric. Ratio of favorable-outcome rates between an
 * unprivileged and a privileged group. Comes from the US "four-fifths rule".
 *
 * Formula (matches IBM AIF360 `disparate_impact_ratio`):
 *     DI = favor-rate(unprivileged) / favor-rate(privileged)
 *
 * Interpretation:
 *     - 1.0     = perfect equality.
 *     - >= 0.80 = acceptable under the EEOC four-fifths rule.
 *     - < 0.80  = signals possible discrimination against unprivileged group.
 * ============================================================================
 */

/** DI = unprivileged selection rate divided by privileged selection rate.
 *  Division by zero is handled:
 *    - privileged rate 0, unprivileged rate 0 -> 1 (equal, both zero)
 *    - privileged rate 0, unprivileged rate > 0 -> Infinity
 */
function calculateDI(unprivSelected, unprivTotal, privSelected, privTotal) {
  if (unprivTotal === 0 || privTotal === 0) {
    throw new Error("unprivTotal and privTotal must be non-zero");
  }
  const rateUnpriv = unprivSelected / unprivTotal;
  const ratePriv = privSelected / privTotal;
  if (ratePriv === 0) return rateUnpriv === 0 ? 1 : Infinity;
  return rateUnpriv / ratePriv;
}

module.exports = { calculateDI };
