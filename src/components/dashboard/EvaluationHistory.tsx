import React from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { Calendar, Tag, CheckCircle, AlertTriangle } from 'lucide-react';
import { getOverallStatus } from '../../services/evaluation/TrendAnalysis';

interface Props {
  runs: EvaluationRun[];
}

export const EvaluationHistory: React.FC<Props> = ({ runs }) => {
  // Sort runs descending by time for history view
  const sortedRuns = [...runs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
          <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--panel-border)' }}>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Run ID</th>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Dataset</th>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Rows</th>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Calculated Metrics</th>
            <th style={{ padding: '16px 24px', fontWeight: 600 }}>Overall Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedRuns.map((run, index) => {
            let calculatedCount = 0;
            let errorCount = 0;
            for (const key in run.metricResults) {
              if (run.metricResults[key].status === 'calculated') calculatedCount++;
              if (run.metricResults[key].status === 'error') errorCount++;
            }
            
            const prevRun = index < sortedRuns.length - 1 ? sortedRuns[index + 1] : undefined;
            const status = getOverallStatus(run, prevRun);
            
            let statusBadgeClass = 'status-pending';
            if (status === 'Improving') statusBadgeClass = 'status-improving';
            if (status === 'Degrading') statusBadgeClass = 'status-degrading';
            if (status === 'Stable') statusBadgeClass = 'status-stable';

            return (
              <tr key={run.runId} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--accent-cyan)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={16} /> {run.runId}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--text-muted)" /> 
                    {new Date(run.timestamp).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{run.datasetName}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{run.sampleCount}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="var(--status-success)" /> {calculatedCount}
                    {errorCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-danger)', marginLeft: '8px' }}>
                        <AlertTriangle size={14} /> {errorCount}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`status-badge ${statusBadgeClass}`}>
                    {status === 'insufficient_data' ? 'Insufficient Data' : status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
