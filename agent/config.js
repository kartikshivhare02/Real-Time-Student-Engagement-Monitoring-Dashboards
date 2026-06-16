// ─────────────────────────────────────────────────────────────
//  config.js  –  STUDENT AGENT CONFIGURATION
//  
//  ⚠️  EDIT BEFORE RUNNING ON STUDENT PCs
//  Set SERVER_IP to the faculty/server PC's IP address on LAN
// ─────────────────────────────────────────────────────────────

module.exports = {
  // ── Server ────────────────────────────────────────────────
  SERVER_IP:   '192.168.1.100',   // ← CHANGE THIS to faculty PC's LAN IP
  SERVER_PORT: 3001,

  // ── Heartbeat ─────────────────────────────────────────────
  HEARTBEAT_INTERVAL_MS: 5000,    // Send activity update every 5 seconds

  // ── Classification Thresholds ────────────────────────────
  IDLE_THRESHOLD_MS:     2 * 60 * 1000,   // 2 min idle → Idle state
  OFFTASK_THRESHOLD_MS:  5 * 60 * 1000,   // 5 min idle → Off-task state
};
