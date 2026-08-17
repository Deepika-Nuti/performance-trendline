import 'fake-indexeddb/auto';
import { getRuns } from './src/services/storage/evaluationStorage';

async function check() {
  const runs = await getRuns();
  console.log('Total stored runs in fake-indexeddb:', runs.length);
  if (runs.length > 0) {
    console.log('Keys in run 0:', Object.keys(runs[0].metricResults));
  }
}
check().catch(console.error);
