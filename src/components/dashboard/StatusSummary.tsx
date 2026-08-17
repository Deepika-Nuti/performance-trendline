import React from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface Props {
  run: EvaluationRun;
  registeredCount: number;
}

export const StatusSummary: React.FC<Props> = ({ run, registeredCount }) => {
  let calculated = 0;
  let notAvailable = 0;
  let needsDefinition = 0;
  let errors = 0;

  for (const metricId in run.metricResults) {
    const res = run.metricResults[metricId];
    if (res.status === 'calculated') calculated++;
    else if (res.status === 'not_available') notAvailable++;
    else if (res.status === 'needs_definition') needsDefinition++;
    else if (res.status === 'error') errors++;
  }

  const statCards = [
    { label: 'Metrics Registered', value: registeredCount, color: 'var(--text-primary)' },
    { label: 'Calculated', value: calculated, color: 'var(--status-success)' },
    { label: 'Not Available', value: notAvailable, color: 'var(--status-warning)' },
    { label: 'Needs Definition', value: needsDefinition, color: 'var(--status-neutral)' }
  ];
  
  if (errors > 0) {
    statCards.push({ label: 'Errors', value: errors, color: 'var(--status-danger)' });
  }

  return (
    <div className="dashboard-grid">
      {statCards.map((stat, i) => (
        <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {stat.label}
          </span>
          <span style={{ fontSize: '36px', fontWeight: 700, color: stat.color, marginTop: '8px' }}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};
