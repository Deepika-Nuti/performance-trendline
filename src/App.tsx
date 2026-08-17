import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MonitoringDashboard } from './components/dashboard/MonitoringDashboard';
import { EvaluationsTab } from './components/dashboard/EvaluationsTab';
import { SettingsTab } from './components/dashboard/SettingsTab';
import { PlaceholderTab } from './components/layout/PlaceholderTab';
function App() {
  const [currentTab, setCurrentTab] = useState('performance');
  const [modelName, setModelName] = useState(() => localStorage.getItem('defaultModelName') || 'labor-assistant');
  const [modelVersion, setModelVersion] = useState(() => localStorage.getItem('defaultModelVersion') || 'v1.0.4');

  const renderContent = () => {
    switch (currentTab) {
      case 'performance':
        return <MonitoringDashboard 
                 modelName={modelName} 
                 modelVersion={modelVersion}
                 onModelChange={(name, version) => {
                   setModelName(name);
                   setModelVersion(version);
                 }}
               />;
      case 'evaluations':
        return <EvaluationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <PlaceholderTab name="Unknown Tab" />;
    }
  };

  return (
    <div className="layout-container">
      <Sidebar 
        activeTab={currentTab} 
        onTabChange={setCurrentTab} 
        modelName={modelName}
        modelVersion={modelVersion}
      />
      {renderContent()}
    </div>
  );
}

export default App;
