import { describe, it, expect } from 'vitest';
import { registry } from '../../src/services/evaluation/registry';

describe('Dashboard Registry Wiring', () => {
  it('should derive the registered metric count exactly from the real registry.length', () => {
    // The MonitoringDashboard now uses registry.length directly instead of the hardcoded old registry.
    // We assert that the real registry has the expected 39 metrics.
    expect(registry.length).toBe(39);
    
    // We also assert that no metric has the old 'metricId' field instead of 'id'
    registry.forEach(metric => {
      expect(metric).toHaveProperty('id');
      expect((metric as any).metricId).toBeUndefined();
    });
  });
});
