import { test, expect } from 'vitest';
import * as bleu from '../../src/services/metrics/logmark/bleu';
import biasMitigation from '../../src/services/metrics/logmark/biasMitigation';
import { calculateCompositeBiasIndex } from '../../src/services/metrics/logmark/biasIndex';

test('cjs interop', () => {
    console.log('bleu:', Object.keys(bleu), 'bleu.default:', bleu.default);
    console.log('biasMitigation:', biasMitigation);
    console.log('calculateCompositeBiasIndex:', calculateCompositeBiasIndex);
});
