import React, { useEffect, useState } from 'react';
import { EvaluationHistory } from './EvaluationHistory';
import { MetricGrid } from './MetricGrid';
import { getRuns } from '../../services/storage/evaluationStorage';
import { EvaluationRun } from '../../types/evaluation';
import { Activity } from 'lucide-react';

export const EvaluationsTab: React.FC = () => {
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allRuns = await getRuns();
      setRuns(allRuns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading evaluations...</div>;
  }

  if (runs.length === 0) {
    return (
      <div className="upload-zone" style={{ marginTop: '64px' }}>
        <Activity size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px', opacity: 0.5 }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>No evaluation data</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Run your first batch evaluation to see history.
        </p>
      </div>
    );
  }

  const selectedRun = selectedRunId ? runs.find(r => r.runId === selectedRunId) : null;
  const previousRun = selectedRun ? runs.find(r => new Date(r.timestamp) < new Date(selectedRun.timestamp) && r.modelName === selectedRun.modelName && r.modelVersion === selectedRun.modelVersion) : undefined;

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>Evaluation Runs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Complete history of all benchmark executions
          </p>
        </div>
      </div>
      
      <EvaluationHistory runs={runs} onRowClick={(runId) => setSelectedRunId(runId)} />

      {selectedRun && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: 0 }}>Metric Results</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                Showing full results for <span style={{ color: 'var(--accent-cyan)' }}>{selectedRun.runId}</span>
              </p>
            </div>
            <button className="btn-secondary" onClick={() => setSelectedRunId(null)}>Close Details</button>
          </div>
          <MetricGrid run={selectedRun} previousRun={previousRun} />
        </div>
      )}
    </div>
  );
};
