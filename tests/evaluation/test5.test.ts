import { describe, it, expect } from 'vitest';
import { normalizeFieldName } from './src/services/metrics/fieldNormalizer';

describe('Field normalizer Test', () => {
  it('should test if candidate normalizes to candidate', () => {
    let out = "";
    out += "normalizeFieldName('candidate'): " + normalizeFieldName('candidate') + "\n";
    out += "normalizeFieldName('reference'): " + normalizeFieldName('reference') + "\n";
    
    const fs = require('fs');
    fs.writeFileSync('test-out4.txt', out);
  });
});
