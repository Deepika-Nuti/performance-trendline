import React from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { getMetricTrend } from '../../services/evaluation/TrendAnalysis';
import { registry } from '../../services/evaluation/registry';

interface Props {
  latestRun: EvaluationRun;
  previousRun?: EvaluationRun;
}

export const LatestVsPrevious: React.FC<Props> = ({ latestRun, previousRun }) => {
  // Filter only metrics that were calculated in the latest run
  const metricsToCompare = registry.filter(
    m => latestRun.metricResults[m.id]?.status === 'calculated'
  );

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
      <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Latest vs Previous</h2>
      
      {!previousRun ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Insufficient history
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', backdropFilter: 'blur(10px)' }}>
              <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--panel-border)' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Metric</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Latest</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Previous</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {metricsToCompare.map(m => {
                if (m.id === 'model-drift') {
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{m.name}</td>
                      <td colSpan={3} style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                        See Metric Results for breakdown
                      </td>
                    </tr>
                  );
                }

                const latest = latestRun.metricResults[m.id] as { status: 'calculated'; value: number };
                const prev = previousRun?.metricResults[m.id];
                
                const trend = getMetricTrend(m.id, latestRun, previousRun);
                
                let deltaColor = 'var(--text-neutral)';
                if (trend.status === 'Improving') deltaColor = 'var(--status-success)';
                if (trend.status === 'Degrading') deltaColor = 'var(--status-danger)';

                const prevText = prev?.status === 'calculated' ? prev.value.toFixed(4) : 'N/A';
                const deltaText = trend.delta !== null ? (trend.delta > 0 ? '+' : '') + trend.delta.toFixed(4) : '-';

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{m.name}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{latest.value.toFixed(4)}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{prevText}</td>
                    <td style={{ padding: '12px 8px', color: deltaColor, fontWeight: 500 }}>
                      {deltaText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
