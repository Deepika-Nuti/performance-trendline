import { EvaluationRun } from '../../types/evaluation';

export interface PerformanceEvaluationService {
  evaluateDataset(file: File, modelName: string, modelVersion: string): Promise<EvaluationRun>;
  getRuns(): Promise<EvaluationRun[]>;
  getRun(runId: string): Promise<EvaluationRun | undefined>;
}
