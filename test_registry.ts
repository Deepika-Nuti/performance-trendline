import { runEvaluationBatch } from '../../src/services/evaluation/adapter';
import { registry } from '../../src/services/evaluation/registry';
console.log(registry.filter(m => m.id === 'bleu-score' || m.id === 'rouge-score'));
