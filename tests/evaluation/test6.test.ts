import { describe, it, expect } from 'vitest';
import { normalizeFieldName } from './src/services/metrics/fieldNormalizer';

describe('Field normalizer Test', () => {
  it('should test column collisions', () => {
    let out = "";
    out += "normalizeFieldName('AI response'): " + normalizeFieldName('AI response') + "\n";
    out += "normalizeFieldName('Answer'): " + normalizeFieldName('Answer') + "\n";
    out += "normalizeFieldName('expected answer'): " + normalizeFieldName('expected answer') + "\n";
    
    const fs = require('fs');
    fs.writeFileSync('test-out5.txt', out);
  });
});
