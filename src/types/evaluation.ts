export type MetricStatus =
  | 'calculated'
  | 'not_available'
  | 'error'
  | 'needs_definition';

export type MetricResult =
  | { status: 'calculated'; value: number; details?: Record<string, any> }
  | { status: 'not_available'; reason: string }
  | { status: 'error'; reason: string }
  | { status: 'needs_definition'; reason: string };

export type InputType =
  | 'row-level'
  | 'aggregate'
  | 'distribution'
  | 'historical'
  | 'configuration';

export interface MetricRegistryEntry {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: InputType;
  implementation: Function;
  inputBuilder: Function;
  higherIsBetter: boolean | null;
  priority?: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  uploadedAt: string;
  files: Array<{ name: string, size: number }>;
}

export interface EvaluationRun {
  runId: string;
  timestamp: string;
  modelName: string;
  modelVersion: string;
  datasetName: string;
  sampleCount: number;
  availableCanonicalFields: string[];
  metricResults: Record<string, MetricResult>;
  kbId?: string;
  baselineRunId?: string;
  metadata: {
    uploadedFileName: string;
    normalizationMapUsed: Record<string, string>;
    unresolvedAmbiguities?: Array<{ field: string; candidates: string[] }>;
  };
}

export type TrendStatus = 'Improving' | 'Stable' | 'Degrading' | 'Insufficient history';
export type OverallStatus = 'Improving' | 'Stable' | 'Degrading' | 'insufficient_data';
