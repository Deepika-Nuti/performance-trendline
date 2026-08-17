import { registry } from './registry';
import { normalizeDataset } from './normalizer';
import { evaluateMetric } from './adapter';
import { saveRun, getRuns, saveRunData, getRunData } from '../storage/evaluationStorage';
import { EvaluationRun, MetricResult } from '../../types/evaluation';
import { v4 as uuidv4 } from 'uuid';

export async function runEvaluation(datasetName: string, rawRows: any[], modelName: string, modelVersion: string): Promise<EvaluationRun> {
  const normalizedRows = normalizeDataset(rawRows);
  const previousRuns = await getRuns();

  const scopedRuns = previousRuns.filter(r => r.modelName === modelName && r.modelVersion === modelVersion);
  const baselineRun = scopedRuns.length > 0 ? scopedRuns[scopedRuns.length - 1] : null;
  let baselineRunRows: any[] | undefined = undefined;
  if (baselineRun) {
    baselineRunRows = await getRunData(baselineRun.runId);
  }

  const metricResults: Record<string, MetricResult> = {};

  const evaluationContext = {
    normalizedRows,
    rawRows,
    baselineRunRows,
    previousRuns,
    currentRunScope: { modelName, modelVersion },
    datasetMetadata: { name: datasetName },
    metricResults // Expose ongoing metric results to downstream metrics
  };

  for (const metricDef of registry) {
    const result = evaluateMetric(metricDef, evaluationContext);
    metricResults[metricDef.id] = {
      status: result.status,
      value: result.value,
      reason: result.reason,
      details: result.details,
      rowBreakdown: (result as any).rowBreakdown
    } as MetricResult;
  }

  const runData: EvaluationRun = {
    runId: `run_${Date.now()}_${uuidv4().substring(0, 8)}`,
    timestamp: new Date().toISOString(),
    modelName,
    modelVersion,
    datasetName: datasetName,
    sampleCount: rawRows.length,
    availableCanonicalFields: ['generated_text', 'reference_text', 'question'],
    metricResults,
    metadata: {
      uploadedFileName: datasetName,
      normalizationMapUsed: {}
    }
  };

  await saveRun(runData);
  await saveRunData(runData.runId, rawRows);
  
  return runData;
}
