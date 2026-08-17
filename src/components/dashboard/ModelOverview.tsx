import React from 'react';
import { Database, Calendar, Tag, ChevronRight } from 'lucide-react';
import { EvaluationRun, OverallStatus } from '../../types/evaluation';

interface Props {
  run: EvaluationRun;
  previousRun?: EvaluationRun;
  overallStatus: OverallStatus;
}

export const ModelOverview: React.FC<Props> = ({ run, previousRun, overallStatus }) => {
  
  const renderStatusBadge = () => {
    switch (overallStatus) {
      case 'Improving':
        return <span className="status-badge status-improving">↑ Improving</span>;
      case 'Degrading':
        return <span className="status-badge status-degrading">↓ Degrading</span>;
      case 'Stable':
        return <span className="status-badge status-stable">→ Stable</span>;
      case 'insufficient_data':
      default:
        return <span className="status-badge status-pending" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>Insufficient data for overall status</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>{run.modelName}</h2>
            <span style={{ padding: '2px 8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
              {run.modelVersion}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> {run.runId}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> {new Date(run.timestamp).toLocaleString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> {run.datasetName} ({run.sampleCount} rows)
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Overall Status
          </div>
          {renderStatusBadge()}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {previousRun ? `vs ${previousRun.runId}` : 'First evaluation — no history to compare yet'}
          </div>
        </div>
      </div>
    </div>
  );
};
