import React, { useState } from 'react';
import { clearRuns } from '../../services/storage/evaluationStorage';
import { XCircle, Save } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [modelName, setModelName] = useState(() => localStorage.getItem('defaultModelName') || 'labor-assistant');
  const [modelVersion, setModelVersion] = useState(() => localStorage.getItem('defaultModelVersion') || 'v1.0.4');
  const [driftBins, setDriftBins] = useState(() => localStorage.getItem('defaultDriftBins') || '10');
  const [clearing, setClearing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveDefaults = () => {
    localStorage.setItem('defaultModelName', modelName.trim());
    localStorage.setItem('defaultModelVersion', modelVersion.trim());
    localStorage.setItem('defaultDriftBins', driftBins.trim());
    setSavedMessage('Settings saved successfully! These will apply as defaults on next load.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleClearRuns = async () => {
    if (window.confirm('Are you sure you want to clear all evaluation runs? This action cannot be undone.')) {
      setClearing(true);
      try {
        await clearRuns();
        alert('All evaluation runs have been cleared.');
      } catch (e) {
        console.error(e);
        alert('Failed to clear runs.');
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="main-content">
      <div className="header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure global dashboard defaults and manage data.
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '32px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Default Scope</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Default Model Name</label>
              <input 
                type="text" 
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Default Model Version</label>
              <input 
                type="text" 
                value={modelVersion}
                onChange={e => setModelVersion(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data Drift Bin Count (Default: 10)</label>
              <input 
                type="number"
                min="2"
                max="100"
                value={driftBins}
                onChange={e => setDriftBins(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                className="btn" 
                onClick={handleSaveDefaults}
                style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}
              >
                <Save size={18} />
                Save Defaults
              </button>
              {savedMessage && <span style={{ color: 'var(--status-success)', fontSize: '14px' }}>{savedMessage}</span>}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--status-danger)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Permanently delete all stored evaluation history. This will clear the IndexedDB storage.
          </p>
          <button 
            className="btn" 
            onClick={handleClearRuns} 
            disabled={clearing} 
            style={{ background: 'transparent', border: '1px solid var(--status-danger)', color: 'var(--status-danger)' }}
          >
            <XCircle size={18} />
            {clearing ? 'Clearing...' : 'Clear All Runs'}
          </button>
        </div>
      </div>
    </div>
  );
};
