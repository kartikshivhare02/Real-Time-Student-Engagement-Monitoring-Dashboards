// components/AnalyticsBar.jsx  –  Top stats summary bar
import { Users, CheckCircle, Clock, XCircle, WifiOff } from 'lucide-react';
import './AnalyticsBar.css';

function StatPill({ icon: Icon, label, value, colorClass, pct }) {
  return (
    <div className={`stat-pill ${colorClass}`}>
      <div className="stat-pill__icon"><Icon size={16} /></div>
      <div className="stat-pill__body">
        <div className="stat-pill__value">
          {value}
          {pct !== undefined && <span className="stat-pill__pct">{pct}%</span>}
        </div>
        <div className="stat-pill__label">{label}</div>
      </div>
      {pct !== undefined && (
        <div className="stat-pill__bar">
          <div className="stat-pill__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export default function AnalyticsBar({ analytics }) {
  if (!analytics) {
    return (
      <div className="analytics-bar">
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-pill skeleton" style={{ height: 72 }} />
        ))}
      </div>
    );
  }

  const { total, active, idle, offTask, disconnected, pctActive, pctIdle, pctOffTask } = analytics;

  return (
    <div className="analytics-bar">
      <StatPill icon={Users}       label="Total Students"   value={total}       colorClass="stat-total" />
      <StatPill icon={CheckCircle} label="Active"           value={active}      colorClass="stat-active"   pct={pctActive} />
      <StatPill icon={Clock}       label="Idle"             value={idle}        colorClass="stat-idle"     pct={pctIdle} />
      <StatPill icon={XCircle}     label="Off-task"         value={offTask}     colorClass="stat-offtask"  pct={pctOffTask} />
      {disconnected > 0 && (
        <StatPill icon={WifiOff}   label="Disconnected"     value={disconnected} colorClass="stat-disc" />
      )}
    </div>
  );
}
