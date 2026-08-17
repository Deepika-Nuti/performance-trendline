import React, { useEffect, useState } from 'react';
import { EvaluationHistory } from './EvaluationHistory';
import { getRuns } from '../../services/storage/evaluationStorage';
import { EvaluationRun } from '../../types/evaluation';
import { Activity } from 'lucide-react';

export const EvaluationsTab: React.FC = () => {
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="main-content">
      <div className="header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>Evaluations</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            History of all model evaluation runs.
          </p>
        </div>
      </div>
      
      {runs.length > 0 ? (
        <div style={{ marginTop: '24px' }}>
          <EvaluationHistory runs={runs} />
        </div>
      ) : (
        <div className="upload-zone" style={{ marginTop: '64px' }}>
          <Activity size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>No evaluation data</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You haven't run any evaluations yet. Go to the dashboard to upload your first batch.
          </p>
        </div>
      )}
    </div>
  );
};
