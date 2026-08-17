import Dexie, { Table } from 'dexie';
import { EvaluationRun, MetricResult } from '../../types/evaluation';

export class MonitoringDatabase extends Dexie {
  evaluationRuns!: Table<EvaluationRun, string>;

  constructor() {
    super('LogmarkMonitoringDB');
    this.version(1).stores({
      evaluationRuns: 'runId, timestamp, modelName' // runId is primary key
    });
  }
}

export const db = new MonitoringDatabase();

/**
 * Persists an evaluation run immutably.
 */
export async function saveRun(run: EvaluationRun): Promise<void> {
  await db.evaluationRuns.add(run);
}

/**
 * Retrieves the most recent run (sorted by timestamp descending).
 */
export async function getLatestRun(): Promise<EvaluationRun | undefined> {
  const runs = await db.evaluationRuns.orderBy('timestamp').reverse().toArray();
  return runs[0];
}

/**
 * Retrieves the run immediately preceding the latest run.
 */
export async function getPreviousRun(): Promise<EvaluationRun | undefined> {
  const runs = await db.evaluationRuns.orderBy('timestamp').reverse().toArray();
  return runs[1];
}

/**
 * Retrieves all runs chronologically.
 */
export async function getAllRuns(): Promise<EvaluationRun[]> {
  return await db.evaluationRuns.orderBy('timestamp').toArray();
}

/**
 * Helper to get time series data for a specific metric.
 * Filters out runs where the metric was not calculated.
 */
export async function getMetricHistory(metricId: string): Promise<Array<{ timestamp: string; value: number; runId: string }>> {
  const runs = await getAllRuns();
  
  return runs
    .filter(run => run.metricResults[metricId]?.status === 'calculated')
    .map(run => {
      const result = run.metricResults[metricId] as { status: 'calculated'; value: number };
      return {
        timestamp: run.timestamp,
        value: result.value,
        runId: run.runId
      };
    });
}
