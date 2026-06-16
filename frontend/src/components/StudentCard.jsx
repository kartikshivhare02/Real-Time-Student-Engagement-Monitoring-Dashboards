// components/StudentCard.jsx
import { useState } from 'react';
import { Monitor, Clock, Wifi, WifiOff } from 'lucide-react';
import './StudentCard.css';

function formatIdleTime(ms) {
  if (!ms || ms < 1000) return 'Active';
  const s = Math.round(ms / 1000);
  if (s < 60)  return `${s}s idle`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m}m ${r}s idle` : `${m}m idle`;
}

function formatLastSeen(ts) {
  if (!ts) return '—';
  const d = Math.round((Date.now() - ts) / 1000);
  if (d < 5)  return 'Just now';
  if (d < 60) return `${d}s ago`;
  return `${Math.floor(d / 60)}m ago`;
}

function MiniSparkline({ history }) {
  if (!history || history.length < 2) return null;
  const W = 60, H = 18;
  const pts = history.slice(-12).map((h, i, arr) => {
    const x = (i / (arr.length - 1)) * W;
    const y = h.state === 'active' ? H * 0.2 : h.state === 'idle' ? H * 0.5 : H * 0.85;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: 0.7 }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StudentCard({ student }) {
  const [expanded, setExpanded] = useState(false);
  const { state, name, seat, activeWindow, idleTime, lastSeen, history, alertCount } = student;
  const disconnected = state === 'disconnected';

  return (
    <div
      className={`student-card student-card--${state || 'disconnected'} ${expanded ? 'student-card--expanded' : ''}`}
      onClick={() => setExpanded(e => !e)}
      title={`Click to ${expanded ? 'collapse' : 'expand'}`}
    >
      {/* Status glow strip */}
      <div className="student-card__strip" />

      <div className="student-card__header">
        <div className="student-card__identity">
          <span className={`status-dot ${state || 'disconnected'}`} />
          <div>
            <div className="student-card__name">{name || 'Unknown'}</div>
            <div className="student-card__seat text-xs text-muted">Seat {seat || '—'}</div>
          </div>
        </div>

        <div className="student-card__right">
          {disconnected
            ? <WifiOff size={13} className="student-card__icon--dim" />
            : <Wifi size={13} className="student-card__icon--live" />
          }
          <span className={`status-badge ${state || 'disconnected'}`}>
            {state === 'off-task' ? 'Off-task' : state || 'offline'}
          </span>
        </div>
      </div>

      <div className="student-card__meta">
        <span className="flex items-center gap-1 text-xs text-muted">
          <Clock size={10} />
          {formatLastSeen(lastSeen)}
        </span>
        <span className="student-card__idle text-xs">
          {!disconnected && formatIdleTime(idleTime)}
        </span>
        <MiniSparkline history={history} />
      </div>

      {expanded && (
        <div className="student-card__detail animate-fadeIn">
          <div className="student-card__detail-row">
            <Monitor size={11} />
            <span className="mono">{activeWindow || '—'}</span>
          </div>
          {alertCount > 0 && (
            <div className="student-card__alert-count">
              ⚠ {alertCount} alert{alertCount > 1 ? 's' : ''} triggered
            </div>
          )}
        </div>
      )}
    </div>
  );
}
