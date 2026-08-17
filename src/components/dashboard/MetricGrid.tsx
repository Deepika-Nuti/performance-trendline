import React from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { registry } from '../../services/evaluation/registry';
import { getMetricTrend } from '../../services/evaluation/TrendAnalysis';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface Props {
  run: EvaluationRun;
  previousRun?: EvaluationRun;
}

export const MetricGrid: React.FC<Props> = ({ run, previousRun }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calculated': return <CheckCircle size={16} color="var(--status-success)" />;
      case 'not_available': return <AlertCircle size={16} color="var(--status-warning)" />;
      case 'error': return <XCircle size={16} color="var(--status-danger)" />;
      case 'needs_definition': return <Info size={16} color="var(--status-neutral)" />;
      default: return null;
    }
  };

  return (
    <div className="metric-grid">
      {registry.map(metric => {
        const result = run.metricResults[metric.id] || { status: 'needs_definition', reason: 'Not implemented' };
        const trend = getMetricTrend(metric.id, run, previousRun);

        let deltaText = '';
        let deltaColor = 'var(--text-muted)';
        if (result.status === 'calculated' && trend.delta !== null) {
          deltaText = (trend.delta > 0 ? '+' : '') + trend.delta.toFixed(4);
          if (trend.status === 'Improving') deltaColor = 'var(--status-success)';
          if (trend.status === 'Degrading') deltaColor = 'var(--status-danger)';
        }

        return (
          <div key={metric.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>{metric.name}</h3>
              {getStatusIcon(result.status)}
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
              {metric.description}
            </div>

                        {result.status === 'calculated' ? (
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                {metric.id === 'model-drift' && result.details ? (
                  <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px' }}>
                    {Object.keys(result.details).map(k => (
                      <React.Fragment key={k}>
                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: result.details[k].status === 'calculated' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {result.details[k].status === 'calculated' ? result.details[k].driftPercentage.toFixed(2) + '%' : 'N/A'}
                        </span>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: result.details[k].classification === 'Significant Drift' ? 'var(--status-danger)' : result.details[k].classification === 'Moderate Drift' ? 'var(--status-warning)' : 'var(--status-success)' }}>
                          {result.details[k].status === 'calculated' ? result.details[k].classification : result.details[k].reason}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {(result as any).value !== undefined ? (result as any).value.toFixed(4) : ''}
                      </span>
                      {result.details && result.details.warning && (
                        <div style={{ fontSize: '11px', color: 'var(--status-warning)', marginTop: '4px', background: 'rgba(255, 170, 0, 0.1)', padding: '6px', borderRadius: '4px', lineHeight: '1.4' }}>
                          <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          {result.details.warning}
                        </div>
                      )}
                      {result.details && result.details.classification && (
                        <span style={{ fontSize: '12px', color: result.details.classification.includes('Significant') ? 'var(--status-danger)' : result.details.classification.includes('Moderate') ? 'var(--status-warning)' : 'var(--status-success)', marginTop: '4px' }}>
                          {result.details.classification}
                        </span>
                      )}
                    </div>
                    {deltaText && (
                      <span style={{ fontSize: '13px', fontWeight: 500, color: deltaColor }}>
                        {deltaText}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (

              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                {result.reason || 'Not calculated'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
