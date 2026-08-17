import fs from 'fs';
import path from 'path';
import { processBatchUpload } from './src/services/evaluation/evaluationRunner.ts';
import { clearRuns, getRuns } from './src/services/storage/evaluationStorage.ts';
import { buildModelDriftInputs } from './src/services/evaluation/inputBuilders.ts';
import { registry } from './src/services/evaluation/registry.ts';
import { runEvaluation } from './src/services/evaluation/runner.ts';

// Wait, doing this via ts-node might be annoying because of TS config.
// I will just use vitest to run a quick test that does it!
