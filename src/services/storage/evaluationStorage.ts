import Dexie, { Table } from 'dexie';
import { EvaluationRun, KnowledgeBase } from '../../types/evaluation';

class EvaluationDatabase extends Dexie {
  runs!: Table<EvaluationRun, string>;
  runData!: Table<{ runId: string, rows: any[] }, string>;
  knowledgeBases!: Table<KnowledgeBase, string>;

  constructor() {
    super('LogmarkModelPerformance');
    this.version(1).stores({
      runs: 'runId, timestamp, modelName'
    });
    this.version(2).stores({
      runs: 'runId, timestamp, modelName',
      runData: 'runId'
    });
    this.version(3).stores({
      runs: 'runId, timestamp, modelName',
      runData: 'runId',
      knowledgeBases: 'id, uploadedAt'
    });
  }
}

export const db = new EvaluationDatabase();

export async function saveKnowledgeBase(kb: KnowledgeBase): Promise<void> {
  await db.knowledgeBases.put(kb);
}

export async function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  return await db.knowledgeBases.orderBy('uploadedAt').reverse().toArray();
}

export async function getKnowledgeBase(kbId: string): Promise<KnowledgeBase | undefined> {
  return await db.knowledgeBases.get(kbId);
}

export async function saveRun(run: EvaluationRun): Promise<void> {
  await db.runs.put(run);
}

export async function saveRunData(runId: string, rows: any[]): Promise<void> {
  await db.runData.put({ runId, rows });
}

export async function getRuns(): Promise<EvaluationRun[]> {
  const runs = await db.runs.orderBy('timestamp').reverse().toArray();
  return runs;
}

export async function getRun(runId: string): Promise<EvaluationRun | undefined> {
  return await db.runs.get(runId);
}

export async function getRunData(runId: string): Promise<any[] | undefined> {
  const data = await db.runData.get(runId);
  return data?.rows;
}

export async function getLatestRun(): Promise<EvaluationRun | null> {
  const runs = await getRuns();
  return runs.length > 0 ? runs[0] : null;
}

export async function getPreviousRun(): Promise<EvaluationRun | null> {
  const runs = await getRuns();
  return runs.length > 1 ? runs[1] : null;
}

export async function clearRuns(): Promise<void> {
  await db.runs.clear();
  await db.runData.clear();
}
