// pages/StudentView.jsx  –  Student's own status view
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Monitor, Clock, CheckCircle, XCircle, Minus } from 'lucide-react';
import './StudentView.css';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const STATE_CONFIG = {
  active:       { label: 'Active',    icon: CheckCircle, color: 'var(--active)',  bg: 'var(--active-dim)' },
  idle:         { label: 'Idle',      icon: Clock,       color: 'var(--idle)',    bg: 'var(--idle-dim)' },
  'off-task':   { label: 'Off-task',  icon: XCircle,     color: 'var(--offtask)', bg: 'var(--offtask-dim)' },
  disconnected: { label: 'Offline',   icon: Minus,       color: 'var(--disconnected)', bg: 'rgba(71,85,105,0.15)' },
};

export default function StudentView({ user, onLogout }) {
  const [myRecord, setMyRecord] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('dashboard:update', ({ data }) => {
      if (data?.name === user?.name) setMyRecord(data);
    });

    socket.on('dashboard:snapshot', ({ students }) => {
      const me = students.find(s => s.name === user?.name);
      if (me) setMyRecord(me);
    });

    socket.emit('faculty:register'); // subscribe to updates

    return () => socket.disconnect();
  }, [user]);

  const state  = myRecord?.state || 'disconnected';
  const cfg    = STATE_CONFIG[state] || STATE_CONFIG.disconnected;
  const Icon   = cfg.icon;

  function fmt(ms) {
    if (!ms || ms < 1000) return 'No idle time';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s} seconds`;
    const m = Math.floor(s / 60);
    return `${m} minute${m > 1 ? 's' : ''}`;
  }

  return (
    <div className="student-view">
      <div className="student-view__blob student-view__blob--1" />
      <div className="student-view__blob student-view__blob--2" />

      <div className="student-view__card glass-card animate-scaleIn">
        <div className="student-view__header">
          <Monitor size={18} />
          <span>EngageTrack</span>
          <button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto', padding: 6 }} onClick={onLogout}>
            ← Back
          </button>
        </div>

        <div className="student-view__profile">
          <div className="student-view__avatar" style={{ background: cfg.bg, color: cfg.color }}>
            <Icon size={32} />
          </div>
          <h2 className="student-view__name">{user?.name}</h2>
          {user?.seat && <p className="text-sm text-muted">Seat: {user.seat}</p>}
        </div>

        <div className="student-view__status" style={{ '--state-color': cfg.color, '--state-bg': cfg.bg }}>
          <span className={`status-dot ${state}`} style={{ width: 10, height: 10 }} />
          <span className="student-view__state-label">{cfg.label}</span>
        </div>

        <div className="student-view__info">
          {myRecord ? (
            <>
              <div className="info-row">
                <span className="info-label">Active Window</span>
                <span className="info-value mono">{myRecord.activeWindow || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Idle Time</span>
                <span className="info-value" style={{ color: state === 'active' ? 'var(--active)' : 'var(--idle)' }}>
                  {fmt(myRecord.idleTime)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Connection</span>
                <span className="info-value" style={{ color: connected ? 'var(--active)' : 'var(--offtask)' }}>
                  {connected ? '✓ Live' : '✗ Disconnected'}
                </span>
              </div>
            </>
          ) : (
            <div className="student-view__waiting">
              <div className="spinner" />
              <p>Waiting for agent data…</p>
              <p className="text-xs text-muted">Make sure the agent is running on this PC</p>
            </div>
          )}
        </div>

        <div className="student-view__tip">
          💡 Open VS Code or your terminal to show as <strong style={{ color: 'var(--active)' }}>Active</strong>
        </div>
      </div>
    </div>
  );
}
