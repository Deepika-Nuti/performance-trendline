import { PerformanceEvaluationService } from './PerformanceEvaluationService';
import { EvaluationRun } from '../../types/evaluation';
import { runEvaluation } from './runner';
import { getRuns, getRun } from '../storage/evaluationStorage';

import { parseDataset } from './datasetParser';

export class LocalPerformanceEvaluationService implements PerformanceEvaluationService {
  async evaluateDataset(file: File, modelName: string, modelVersion: string): Promise<EvaluationRun> {
    const rawRows = await parseDataset(file);
    return runEvaluation(file.name, rawRows, modelName, modelVersion);
  }

  async getRuns(): Promise<EvaluationRun[]> {
    return getRuns();
  }

  async getRun(runId: string): Promise<EvaluationRun | undefined> {
    return getRun(runId);
  }
}

// Export a singleton instance for immediate use
export const evaluationService = new LocalPerformanceEvaluationService();
