// components/AlertPanel.jsx  –  Right sidebar for alerts
import { AlertTriangle, X, Bell, BellOff } from 'lucide-react';
import './AlertPanel.css';

function formatState(state) {
  return state === 'off-task' ? 'Off-task' : state?.charAt(0).toUpperCase() + state?.slice(1) || 'Unknown';
}

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s/60)}m ago`;
}

export default function AlertPanel({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-panel alert-panel--empty">
        <BellOff size={28} className="alert-panel__empty-icon" />
        <p>No alerts</p>
        <span>All students are being monitored</span>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <div className="alert-panel__header">
        <Bell size={15} />
        <span>Live Alerts</span>
        <span className="alert-panel__count">{alerts.length}</span>
      </div>
      <div className="alert-panel__list">
        {alerts.map((alert) => (
          <div key={alert.studentId} className={`alert-item alert-item--${alert.state?.replace('-','')}`}>
            <div className="alert-item__top">
              <AlertTriangle size={13} />
              <strong>{alert.name}</strong>
              <span className="alert-item__time text-xs">{timeAgo(alert.ts)}</span>
              <button
                className="alert-item__dismiss"
                onClick={() => onDismiss(alert.studentId)}
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
            <div className="alert-item__body text-xs">
              <span className={`status-badge ${alert.state}`}>{formatState(alert.state)}</span>
              <span className="text-muted">Seat {alert.seat}</span>
            </div>
            <p className="alert-item__msg text-xs">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
