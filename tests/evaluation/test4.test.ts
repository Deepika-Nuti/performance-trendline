import { describe, it, expect } from 'vitest';
import { normalizeFieldName } from './src/services/metrics/fieldNormalizer';

describe('Field normalizer Test', () => {
  it('should test if Type of issue is dropped', () => {
    let out = "";
    out += "normalizeFieldName('Type of issue'): " + normalizeFieldName('Type of issue') + "\n";
    out += "normalizeFieldName('is_adversarial'): " + normalizeFieldName('is_adversarial') + "\n";
    out += "normalizeFieldName('protected_group'): " + normalizeFieldName('protected_group') + "\n";
    
    const fs = require('fs');
    fs.writeFileSync('test-out3.txt', out);
  });
});
