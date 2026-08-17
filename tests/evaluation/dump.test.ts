import { describe, it } from 'vitest';
import 'fake-indexeddb/auto';
import { getRuns } from '../../src/services/storage/evaluationStorage';
import * as fs from 'fs';

describe('DB Dump', () => {
  it('should dump db', async () => {
    const runs = await getRuns();
    let out = 'TOTAL_RUNS_IN_DB=' + runs.length + '\n';
    if (runs.length > 0) {
      out += 'KEYS_IN_RUN_0=' + Object.keys(runs[0].metricResults).join(',') + '\n';
    }
    fs.writeFileSync('db-dump.txt', out);
  });
});
