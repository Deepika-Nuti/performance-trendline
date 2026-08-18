import React, { useState, useEffect } from 'react';
import { UploadCloud, Activity, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { EvaluationRun, OverallStatus, TrendStatus, KnowledgeBase } from '../../types/evaluation';
import { getLatestRun, getPreviousRun, getRuns as getAllRuns, clearRuns, getKnowledgeBases, saveKnowledgeBase } from '../../services/storage/evaluationStorage';
import { processBatchUpload } from '../../services/evaluation/evaluationRunner';
import { getOverallStatus, getMetricTrend } from '../../services/evaluation/TrendAnalysis';
import { registry } from '../../services/evaluation/registry';

import { ModelOverview } from './ModelOverview';
import { StatusSummary } from './StatusSummary';
import { PerformanceTrendline } from './PerformanceTrendline';
import { LatestVsPrevious } from './LatestVsPrevious';
import { MetricGrid } from './MetricGrid';
import { EvaluationHistory } from './EvaluationHistory';

interface DashboardProps {
  modelName: string;
  modelVersion: string;
  onModelChange: (name: string, version: string) => void;
}

export const MonitoringDashboard: React.FC<DashboardProps> = ({ modelName, modelVersion, onModelChange }) => {
  const [latestRun, setLatestRun] = useState<EvaluationRun | undefined>();
  const [previousRun, setPreviousRun] = useState<EvaluationRun | undefined>();
  const [allRuns, setAllRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const [selectedBaselineRunId, setSelectedBaselineRunId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const runs = await getAllRuns();
    setAllRuns(runs);

    if (runs.length > 0) {
      setLatestRun(runs[0]);
      setPreviousRun(runs.length > 1 ? runs[1] : undefined);
    }
    
    const loadedKbs = await getKnowledgeBases();
    setKbs(loadedKbs);

    setLoading(false);
  };

  const handleKbUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const kbName = prompt('Enter a name for this Knowledge Base:', files[0].name.replace(/\.[^/.]+$/, ""));
    if (!kbName) {
      event.target.value = '';
      return;
    }
    
    const newKb: KnowledgeBase = {
      id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: kbName,
      uploadedAt: new Date().toISOString(),
      files: Array.from(files).map(f => ({ name: f.name, size: f.size }))
    };
    
    await saveKnowledgeBase(newKb);
    await loadData();
    setSelectedKbId(newKb.id);
    event.target.value = '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!modelName.trim() || !modelVersion.trim()) {
      alert('Please enter a valid Model Name and Version before uploading.');
      event.target.value = ''; // Reset input
      return;
    }

    setUploading(true);
    try {
      await processBatchUpload(file, modelName.trim(), modelVersion.trim(), file.name.replace(/\.[^/.]+$/, ""), selectedKbId, selectedBaselineRunId);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Upload failed. See console for details.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleClearRuns = async () => {
    if (window.confirm('Are you sure you want to clear all evaluation runs? This action cannot be undone.')) {
      setLoading(true);
      try {
        await clearRuns();
        setAllRuns([]);
        setLatestRun(undefined);
        setPreviousRun(undefined);
      } catch (e) {
        console.error(e);
        alert('Failed to clear runs.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading metrics...</div>;
  }

  const overallStatus = latestRun ? getOverallStatus(latestRun, previousRun) : 'insufficient_data';
  const registeredCount = registry.length;

  return (
    <div className="main-content">
      <div className="header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>AI Model Performance Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enterprise-grade evaluation tracking and drift detection
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Model Name" 
              value={modelName}
              onChange={e => onModelChange(e.target.value, modelVersion)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
            />
            <input 
              type="text" 
              placeholder="Version" 
              value={modelVersion}
              onChange={e => onModelChange(modelName, e.target.value)}
              style={{ width: '100px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedKbId}
              onChange={e => setSelectedKbId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', minWidth: '150px' }}
            >
              <option value="">No KB Linked</option>
              {kbs.map(kb => (
                <option key={kb.id} value={kb.id}>{kb.name}</option>
              ))}
            </select>
            <label className="btn-secondary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
              <UploadCloud size={14} /> Upload KB
              <input 
                type="file" 
                multiple
                style={{ display: 'none' }} 
                onChange={handleKbUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedBaselineRunId}
              onChange={e => setSelectedBaselineRunId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', minWidth: '200px' }}
            >
              <option value="">No Baseline (Auto / None)</option>
              {allRuns.map(run => (
                <option key={run.runId} value={run.runId}>{run.runId} - {new Date(run.timestamp).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label className="btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
              <UploadCloud size={18} />
              {uploading ? 'Processing...' : 'Upload Batch Results'}
              <input 
                type="file" 
                accept=".csv,.xlsx,.json" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {latestRun ? (
        <>
          <ModelOverview 
            run={latestRun} 
            previousRun={previousRun}
            overallStatus={overallStatus} 
          />
          
          <StatusSummary 
            run={latestRun}
            registeredCount={registeredCount} 
          />
          
          <div className="trendline-section">
            <PerformanceTrendline runs={allRuns} />
            <LatestVsPrevious latestRun={latestRun} previousRun={previousRun} />
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>Metric Results</h2>
          <MetricGrid run={latestRun} previousRun={previousRun} />
          
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>Evaluation History</h2>
            <EvaluationHistory runs={allRuns} />
          </div>
        </>
      ) : (
        <div className="upload-zone" style={{ marginTop: '64px' }}>
          <Activity size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>No evaluation data</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ensure your Model Name and Version are set, then upload your first batch results to begin monitoring performance.
          </p>
        </div>
      )}
    </div>
  );
};
