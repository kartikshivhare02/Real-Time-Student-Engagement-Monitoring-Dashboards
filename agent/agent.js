// ─────────────────────────────────────────────────────────────
//  agent.js  –  Student Activity Agent (Zero Native Modules)
//  Uses PowerShell to get idle time + active window on Windows
//  Only requires: socket.io-client
// ─────────────────────────────────────────────────────────────

const { io }       = require('socket.io-client');
const { execSync } = require('child_process');
const readline     = require('readline');
const os           = require('os');
const cfg          = require('./config');
const { classify } = require('./classifier');

// Stable ID from hostname
const STUDENT_ID = os.hostname().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

// ── PowerShell helpers ────────────────────────────────────────

/**
 * Get system idle time in milliseconds via GetLastInputInfo.
 * Runs a tiny inline PowerShell script — no binary needed.
 */
function getIdleTimeMs() {
  try {
    const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class IdleTimer {
    [DllImport("user32.dll")]
    static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    [StructLayout(LayoutKind.Sequential)]
    struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    public static uint GetIdleMs() {
        LASTINPUTINFO info = new LASTINPUTINFO();
        info.cbSize = (uint)Marshal.SizeOf(info);
        GetLastInputInfo(ref info);
        return (uint)(Environment.TickCount - (int)info.dwTime);
    }
}
"@
[IdleTimer]::GetIdleMs()
`.trim();
    const result = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      timeout: 4000,
      windowsHide: true,
    }).toString().trim();
    const ms = parseInt(result, 10);
    return isNaN(ms) ? 0 : ms;
  } catch {
    return 0;
  }
}

/**
 * Get the foreground window process name + title via PowerShell.
 */
function getActiveWindow() {
  try {
    const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinInfo {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
}
"@
$hwnd = [WinInfo]::GetForegroundWindow()
$sb = New-Object System.Text.StringBuilder 256
[WinInfo]::GetWindowText($hwnd, $sb, 256) | Out-Null
$pid2 = 0
[WinInfo]::GetWindowThreadProcessId($hwnd, [ref]$pid2) | Out-Null
$proc = Get-Process -Id $pid2 -ErrorAction SilentlyContinue
"$($proc.Name)|$($sb.ToString())"
`.trim();
    const result = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      timeout: 4000,
      windowsHide: true,
    }).toString().trim();
    const [appName, ...titleParts] = result.split('|');
    return { appName: appName || '', title: titleParts.join('|') || '' };
  } catch {
    return { appName: '', title: '' };
  }
}

// ── Prompt helper ─────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function prompt(q) { return new Promise(r => rl.question(q, r)); }

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   EngageTrack — Student Agent                    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Computer ID : ${STUDENT_ID}`);
  console.log(`  Server      : ${cfg.SERVER_IP}:${cfg.SERVER_PORT}\n`);

  const name = await prompt('  Enter your Full Name : ');
  const seat = await prompt('  Enter your Seat No.  : ');
  rl.close();

  const studentName = name.trim() || STUDENT_ID;
  const studentSeat = seat.trim() || '—';
  const studentId   = `${STUDENT_ID}_${studentName.replace(/\s+/g, '').toLowerCase()}`;

  console.log(`\n  Hello, ${studentName}! Connecting to server…\n`);

  const socket = io(`http://${cfg.SERVER_IP}:${cfg.SERVER_PORT}`, {
    reconnectionDelay:    2000,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => {
    console.log(`  ✓ Connected (${socket.id})`);
    socket.emit('agent:register', { studentId, name: studentName, seat: studentSeat });
    startHeartbeat(socket, studentId, studentName, studentSeat);
  });

  socket.on('disconnect', (r) => console.log(`  ✗ Disconnected: ${r}. Reconnecting…`));
  socket.on('connect_error', (e) => {
    console.log(`  ✗ Cannot reach server: ${e.message}`);
    console.log(`    Make sure server is running at http://${cfg.SERVER_IP}:${cfg.SERVER_PORT}`);
  });
}

// ── Heartbeat loop ────────────────────────────────────────────
function startHeartbeat(socket, studentId, name, seat) {
  let lastState = null;

  async function beat() {
    const idleMs            = getIdleTimeMs();
    const { appName, title } = getActiveWindow();
    const state             = classify(idleMs, appName, title);

    if (state !== lastState) {
      const emoji = { active: '🟢', idle: '🟡', 'off-task': '🔴' }[state] ?? '⚪';
      console.log(`  ${emoji} ${state.toUpperCase().padEnd(8)} | ${appName || '—'} | idle ${Math.round(idleMs / 1000)}s`);
      lastState = state;
    }

    socket.emit('agent:heartbeat', {
      studentId,
      name,
      seat,
      state,
      activeWindow: `${appName} — ${title}`.slice(0, 120),
      idleTime:     idleMs,
    });
  }

  beat();
  setInterval(beat, cfg.HEARTBEAT_INTERVAL_MS);
}

main().catch(console.error);
