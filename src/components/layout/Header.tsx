import React from 'react';
import { Upload, Download, FileJson } from 'lucide-react';

interface HeaderProps {
  onEvaluateNew: () => void;
}

export function Header({ onEvaluateNew }: HeaderProps) {
  return (
    <div className="header">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, color: 'white' }}>Model Performance Monitoring</h1>
          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>OFFICIAL PERFORMANCE MODULE</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Evaluate model quality across historical evaluation runs with dynamic trendline tracking.</p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary">
          <FileJson size={18} /> API Spec
        </button>
        <button className="btn btn-secondary">
          <Download size={18} /> Export History
        </button>
        <button className="btn" onClick={onEvaluateNew}>
          <Upload size={18} /> Evaluate New Batch
        </button>
      </div>
    </div>
  );
}
