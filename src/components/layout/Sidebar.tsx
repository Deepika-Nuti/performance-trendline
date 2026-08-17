import React from 'react';
import { Activity, LayoutDashboard, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  modelName: string;
  modelVersion: string;
}

export function Sidebar({ activeTab, onTabChange, modelName, modelVersion }: SidebarProps) {
  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent-cyan)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>L</div>
        <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-primary)', letterSpacing: 1 }}>Logmark</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <div 
          className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => onTabChange('performance')}
        >
          <Activity size={20} />
          <span style={{ marginLeft: 12 }}>Model Performance</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'evaluations' ? 'active' : ''}`}
          onClick={() => onTabChange('evaluations')}
        >
          <LayoutDashboard size={20} />
          <span style={{ marginLeft: 12 }}>Evaluations</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings size={20} />
          <span style={{ marginLeft: 12 }}>Settings</span>
        </div>
      </nav>

      <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 24, marginTop: 'auto' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CURRENT MODEL</div>
        <div style={{ fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>{modelName || 'None'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{modelVersion || 'N/A'}</div>
      </div>
    </div>
  );
}
