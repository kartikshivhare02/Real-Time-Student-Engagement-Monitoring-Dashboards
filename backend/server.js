// ─────────────────────────────────────────────────────────────
//  server.js  –  Express + Socket.IO Backend
//  Real-Time Student Engagement Monitoring Dashboard
// ─────────────────────────────────────────────────────────────
require('dotenv').config();

const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const cors      = require('cors');
const path      = require('path');
const os        = require('os');

const sm = require('./studentManager');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 10_000,
  pingTimeout:  20_000,
});

const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve built frontend (optional, for production)
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ── REST API ─────────────────────────────────────────────────
app.get('/api/students', (req, res) => {
  res.json(sm.getAllStudents());
});

app.get('/api/analytics', (req, res) => {
  res.json(sm.getAnalytics());
});

app.get('/api/student/:id', (req, res) => {
  const student = sm.getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// ── Socket.IO Events ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // ── Student Agent registers ──────────────────────────────
  socket.on('agent:register', ({ studentId, name, seat }) => {
    socket.studentId = studentId;
    socket.role      = 'student';
    sm.ensureStudent(studentId, name, seat);
    console.log(`[AGENT] Registered: ${name} (${studentId}) @ seat ${seat}`);

    // Notify faculty
    io.emit('dashboard:update', {
      type: 'student_joined',
      data: sm.getStudent(studentId),
    });
  });

  // ── Student sends heartbeat ──────────────────────────────
  socket.on('agent:heartbeat', ({ studentId, name, seat, state, activeWindow, idleTime }) => {
    const { changed, record } = sm.updateHeartbeat(
      studentId, name, seat,
      { state, activeWindow, idleTime }
    );

    // Broadcast to faculty dashboard
    io.emit('dashboard:update', {
      type:    'student_update',
      data:    sm.getStudent(studentId),
      changed,
    });

    // Check if an alert should fire
    if (sm.shouldAlert(studentId)) {
      sm.recordAlert(studentId);
      io.emit('dashboard:alert', {
        studentId,
        name:     record.name,
        seat:     record.seat,
        state:    record.state,
        idleTime: record.idleTime,
        message:  `${record.name} has been ${record.state} for over 5 minutes!`,
        ts:       Date.now(),
      });
    }
  });

  // ── Faculty registers ────────────────────────────────────
  socket.on('faculty:register', () => {
    socket.role = 'faculty';
    console.log(`[FACULTY] Dashboard connected: ${socket.id}`);
    // Send initial snapshot
    socket.emit('dashboard:snapshot', {
      students:  sm.getAllStudents(),
      analytics: sm.getAnalytics(),
    });
  });

  // ── Faculty dismisses an alert ───────────────────────────
  socket.on('faculty:dismiss_alert', ({ studentId }) => {
    console.log(`[FACULTY] Dismissed alert for ${studentId}`);
    // No special action needed — alert won't re-fire until cooldown
  });

  // ── Disconnect ───────────────────────────────────────────
  socket.on('disconnect', () => {
    if (socket.role === 'student' && socket.studentId) {
      sm.markDisconnected(socket.studentId);
      io.emit('dashboard:update', {
        type: 'student_disconnected',
        data: sm.getStudent(socket.studentId),
      });
      console.log(`[-] Agent disconnected: ${socket.studentId}`);
    } else {
      console.log(`[-] Client disconnected: ${socket.id}`);
    }
  });
});

// ── Staleness Checker ────────────────────────────────────────
sm.startStalenessCheck(io);

// ── Broadcast analytics every 10s ───────────────────────────
setInterval(() => {
  io.emit('dashboard:analytics', sm.getAnalytics());
}, 10_000);

// ── Start Server ─────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  let lanIP = 'localhost';
  Object.values(ifaces).forEach(list => {
    list.forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIP = iface.address;
      }
    });
  });

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  Student Engagement Monitor — Backend Server     ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Local:   http://localhost:${PORT}                  ║`);
  console.log(`║  Network: http://${lanIP}:${PORT}               ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Share the Network URL with:                     ║');
  console.log('║    • Students  → edit agent/config.js            ║');
  console.log('║    • Faculty   → open in browser                 ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
});
