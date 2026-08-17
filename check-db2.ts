import 'fake-indexeddb/auto';
import { getRuns } from './src/services/storage/evaluationStorage';

async function check() {
  const runs = await getRuns();
  console.log('Total stored runs:', runs.length);
  runs.forEach(r => {
    if (r.datasetName.includes('2026-08-06-03-Deepika') || true) {
      console.log(Run : dataset=, time=, modelName="", modelVersion="");
    }
  });
}
check().catch(console.error);
