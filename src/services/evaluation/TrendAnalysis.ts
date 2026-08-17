import { EvaluationRun, MetricResult, OverallStatus, TrendStatus } from '../../types/evaluation';
import { registry } from './registry';

export const MIN_METRICS_FOR_OVERALL_STATUS = 3;

export function getMetricTrend(
  metricId: string, 
  latestRun: EvaluationRun, 
  previousRun?: EvaluationRun
): { status: TrendStatus; delta: number | null } {
  
  if (!previousRun) {
    return { status: 'Insufficient history', delta: null };
  }

  const latestResult = latestRun.metricResults[metricId];
  const previousResult = previousRun.metricResults[metricId];

  if (latestResult?.status !== 'calculated' || previousResult?.status !== 'calculated') {
    return { status: 'Insufficient history', delta: null };
  }

  const delta = latestResult.value - previousResult.value;
  
  const metricDef = registry.find(m => m.id === metricId);
  const higherIsBetter = metricDef?.higherIsBetter;

  // Epsilon for stability comparison
  const EPSILON = 0.0001;

  if (Math.abs(delta) < EPSILON) {
    return { status: 'Stable', delta };
  }

  if (higherIsBetter === true) {
    return { status: delta > 0 ? 'Improving' : 'Degrading', delta };
  } else if (higherIsBetter === false) {
    return { status: delta < 0 ? 'Improving' : 'Degrading', delta };
  } else {
    // If higherIsBetter is null, we can't classify
    return { status: 'Insufficient history', delta };
  }
}

/**
 * Computes the overall model status (Improving / Stable / Degrading / insufficient_data).
 * Based on unweighted majority voting of metrics that have sufficient history.
 */
export function getOverallStatus(latestRun: EvaluationRun, previousRun?: EvaluationRun): OverallStatus {
  if (!previousRun) {
    return 'insufficient_data';
  }

  let improvingVotes = 0;
  let degradingVotes = 0;
  let stableVotes = 0;
  let validMetrics = 0;

  for (const metric of registry) {
    if (metric.excludeFromVerdict) {
      continue;
    }
    const trend = getMetricTrend(metric.id, latestRun, previousRun);
    
    if (trend.status === 'Improving' || trend.status === 'Degrading' || trend.status === 'Stable') {
      validMetrics++;
      if (trend.status === 'Improving') improvingVotes++;
      else if (trend.status === 'Degrading') degradingVotes++;
      else stableVotes++;
    }
  }

  if (validMetrics < MIN_METRICS_FOR_OVERALL_STATUS) {
    return 'insufficient_data';
  }

  // Unweighted majority
  if (improvingVotes > degradingVotes && improvingVotes > stableVotes) {
    return 'Improving';
  }
  
  if (degradingVotes > improvingVotes && degradingVotes > stableVotes) {
    return 'Degrading';
  }

  // Tie or stable is majority
  return 'Stable';
}
