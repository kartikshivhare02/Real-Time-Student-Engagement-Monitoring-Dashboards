// ─────────────────────────────────────────────────────────────
//  studentManager.js  –  In-memory student state store
//  Tracks engagement state, history, and alert thresholds
// ─────────────────────────────────────────────────────────────

const IDLE_THRESHOLD_MS    = 2 * 60 * 1000;   // 2 min  → Idle
const OFFTASK_THRESHOLD_MS = 5 * 60 * 1000;   // 5 min  → Off-task (no heartbeat)
const ALERT_COOLDOWN_MS    = 10 * 60 * 1000;  // 10 min between repeat alerts
const MAX_HISTORY          = 60;               // Keep last 60 state snapshots per student

const students = new Map();  // studentId → studentRecord

function ensureStudent(id, name, seat) {
  if (!students.has(id)) {
    students.set(id, {
      id,
      name:       name || `Student ${id}`,
      seat:       seat || '—',
      state:      'active',
      activeWindow: '',
      idleTime:   0,
      lastSeen:   Date.now(),
      joinedAt:   Date.now(),
      alertCount: 0,
      lastAlertAt: 0,
      history:    [],  // [{ ts, state }]
    });
  }
  return students.get(id);
}

function updateHeartbeat(id, name, seat, { state, activeWindow, idleTime }) {
  const rec = ensureStudent(id, name, seat);
  const prevState = rec.state;

  rec.state        = state;
  rec.activeWindow = activeWindow || '';
  rec.idleTime     = idleTime || 0;
  rec.lastSeen     = Date.now();

  // Append to history (rolling window)
  rec.history.push({ ts: Date.now(), state });
  if (rec.history.length > MAX_HISTORY) rec.history.shift();

  // Update name/seat if provided
  if (name) rec.name = name;
  if (seat) rec.seat = seat;

  return { changed: prevState !== state, record: rec };
}

function markDisconnected(id) {
  const rec = students.get(id);
  if (rec) {
    rec.state = 'disconnected';
    rec.history.push({ ts: Date.now(), state: 'disconnected' });
    if (rec.history.length > MAX_HISTORY) rec.history.shift();
  }
}

function shouldAlert(id) {
  const rec = students.get(id);
  if (!rec) return false;
  const alertable = rec.state === 'idle' || rec.state === 'off-task';
  const cooldownPassed = (Date.now() - rec.lastAlertAt) > ALERT_COOLDOWN_MS;
  const prolongedIdle = rec.idleTime > OFFTASK_THRESHOLD_MS;
  return alertable && cooldownPassed && prolongedIdle;
}

function recordAlert(id) {
  const rec = students.get(id);
  if (rec) {
    rec.alertCount++;
    rec.lastAlertAt = Date.now();
  }
}

function getAllStudents() {
  return Array.from(students.values()).map(r => toPublic(r));
}

function getStudent(id) {
  const rec = students.get(id);
  return rec ? toPublic(rec) : null;
}

function getAnalytics() {
  const all = Array.from(students.values()).filter(r => r.state !== 'disconnected');
  const total      = all.length;
  const active     = all.filter(r => r.state === 'active').length;
  const idle       = all.filter(r => r.state === 'idle').length;
  const offTask    = all.filter(r => r.state === 'off-task').length;
  const disconnected = Array.from(students.values()).filter(r => r.state === 'disconnected').length;

  return {
    total,
    active,
    idle,
    offTask,
    disconnected,
    pctActive:  total ? Math.round((active  / total) * 100) : 0,
    pctIdle:    total ? Math.round((idle    / total) * 100) : 0,
    pctOffTask: total ? Math.round((offTask / total) * 100) : 0,
    timestamp:  Date.now(),
  };
}

// Strip internal fields for public API
function toPublic(rec) {
  return {
    id:           rec.id,
    name:         rec.name,
    seat:         rec.seat,
    state:        rec.state,
    activeWindow: rec.activeWindow,
    idleTime:     rec.idleTime,
    lastSeen:     rec.lastSeen,
    joinedAt:     rec.joinedAt,
    alertCount:   rec.alertCount,
    history:      rec.history.slice(-20), // send last 20 for sparkline
  };
}

// Periodically check for stale students (no heartbeat) and mark them off-task
function startStalenessCheck(io) {
  setInterval(() => {
    const now = Date.now();
    students.forEach((rec, id) => {
      if (rec.state === 'disconnected') return;
      const stale = now - rec.lastSeen;
      if (stale > OFFTASK_THRESHOLD_MS) {
        if (rec.state !== 'off-task') {
          rec.state = 'off-task';
          rec.history.push({ ts: now, state: 'off-task' });
          io.emit('dashboard:update', { type: 'student_update', data: toPublic(rec) });
        }
      } else if (stale > IDLE_THRESHOLD_MS) {
        if (rec.state !== 'idle' && rec.state !== 'off-task') {
          rec.state = 'idle';
          rec.history.push({ ts: now, state: 'idle' });
          io.emit('dashboard:update', { type: 'student_update', data: toPublic(rec) });
        }
      }
    });
  }, 10_000); // check every 10 seconds
}

module.exports = {
  ensureStudent,
  updateHeartbeat,
  markDisconnected,
  shouldAlert,
  recordAlert,
  getAllStudents,
  getStudent,
  getAnalytics,
  startStalenessCheck,
};
