import React, { useState, useMemo, useEffect } from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { registry } from '../../services/evaluation/registry';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  runs: EvaluationRun[];
}

export const PerformanceTrendline: React.FC<Props> = ({ runs }) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string>('');
  const latestRun = runs.length > 0 ? runs[runs.length - 1] : undefined;

  useEffect(() => {
    if (!latestRun) return;

    // Find all metrics that were calculated in the latest run and have a direct numeric value
    const calculatedInLatest = registry.filter(m => 
      m.id !== 'model-drift' && latestRun.metricResults[m.id]?.status === 'calculated'
    );

    if (calculatedInLatest.length > 0) {
      // Sort by priority descending
      calculatedInLatest.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      // Only set if we haven't already selected one, or the selected one isn't valid anymore
      if (!selectedMetricId || !calculatedInLatest.find(m => m.id === selectedMetricId)) {
        setSelectedMetricId(calculatedInLatest[0].id);
      }
    }
  }, [latestRun, registry]);

  const chartData = useMemo(() => {
    if (!selectedMetricId) return [];

    return runs
      .filter(r => r.metricResults[selectedMetricId]?.status === 'calculated')
      .map(r => {
        const res = r.metricResults[selectedMetricId] as { status: 'calculated'; value: number };
        return {
          timestamp: new Date(r.timestamp).toLocaleDateString() + ' ' + new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          value: Number(res.value.toFixed(4)),
          runId: r.runId
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [runs, selectedMetricId]);

  const selectedMetricDef = registry.find(m => m.id === selectedMetricId);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Performance Trendline</h2>
        
        <select 
          className="metric-selector"
          value={selectedMetricId} 
          onChange={(e) => setSelectedMetricId(e.target.value)}
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>Select a metric</option>
          {registry.filter(m => m.category !== 'Governance').map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="var(--text-muted)" 
                fontSize={12}
                tickMargin={10}
                tickFormatter={(val) => val.split(' ')[0]} // just show date
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={12}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(5, 10, 21, 0.9)', 
                  border: '1px solid var(--panel-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
                itemStyle={{ color: 'var(--accent-cyan)' }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                formatter={(value: number) => [value, selectedMetricDef?.name || 'Value']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.runId + ' - ' + label}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--accent-cyan)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, fill: 'var(--accent-cyan)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Not enough history yet. Requires at least 2 calculated runs.
          </div>
        )}
      </div>
    </div>
  );
};
