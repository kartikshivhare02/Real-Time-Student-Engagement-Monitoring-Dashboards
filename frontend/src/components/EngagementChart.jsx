// components/EngagementChart.jsx  –  Class engagement trend chart
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useEffect, useRef, useState } from 'react';
import './EngagementChart.css';

// Keep a rolling 20-point history
const MAX_POINTS = 20;

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__time">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

export default function EngagementChart({ analytics }) {
  const [history, setHistory] = useState([]);
  const prevAnalytics = useRef(null);

  useEffect(() => {
    if (!analytics) return;
    if (JSON.stringify(analytics) === JSON.stringify(prevAnalytics.current)) return;
    prevAnalytics.current = analytics;

    setHistory(prev => {
      const point = {
        time:    formatTime(analytics.timestamp || Date.now()),
        Active:  analytics.active  || 0,
        Idle:    analytics.idle    || 0,
        OffTask: analytics.offTask || 0,
      };
      const next = [...prev, point];
      return next.slice(-MAX_POINTS);
    });
  }, [analytics]);

  if (history.length < 2) {
    return (
      <div className="engagement-chart engagement-chart--empty">
        <div className="spinner" />
        <span>Collecting data...</span>
      </div>
    );
  }

  return (
    <div className="engagement-chart">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActive"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradIdle"    x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOffTask" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 9, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: '0.72rem', paddingTop: 4 }}
          />
          <Area type="monotone" dataKey="Active"  stroke="#22c55e" fill="url(#gradActive)"  strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="Idle"    stroke="#f59e0b" fill="url(#gradIdle)"    strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="OffTask" stroke="#ef4444" fill="url(#gradOffTask)" strokeWidth={2} dot={false} name="Off-task" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
