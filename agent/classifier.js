// ─────────────────────────────────────────────────────────────
//  classifier.js  –  Student Engagement State Classifier
//  Determines Active / Idle / Off-task from window + idle time
// ─────────────────────────────────────────────────────────────

const { IDLE_THRESHOLD_MS, OFFTASK_THRESHOLD_MS } = require('./config');

// Apps considered "coding/productive" → Active
const CODING_APPS = [
  'code',           // VS Code
  'code.exe',
  'devenv',         // Visual Studio
  'devenv.exe',
  'codeblocks',     // Code::Blocks
  'codeblocks.exe',
  'devcpp',         // Dev-C++
  'devcpp.exe',
  'eclipse',
  'eclipse.exe',
  'idea64',         // IntelliJ IDEA
  'idea64.exe',
  'pycharm64',      // PyCharm
  'pycharm64.exe',
  'sublime_text',
  'sublime_text.exe',
  'notepad++',
  'notepad++.exe',
  'atom',
  'atom.exe',
  'vim',
  'nvim',
  'gvim',
  'cmd',            // Command Prompt
  'cmd.exe',
  'powershell',
  'powershell.exe',
  'terminal',
  'wt',             // Windows Terminal
  'wt.exe',
  'bash',
  'python',
  'python.exe',
  'java',
  'javac',
  'gcc',
  'g++',
  'node',
  'node.exe',
  'turbo c',        // Turbo C
  'turboc',
];

// Browser window titles that signal distraction → Off-task
const OFFTASK_TITLE_KEYWORDS = [
  'youtube',
  'facebook',
  'instagram',
  'twitter',
  'x.com',
  'snapchat',
  'tiktok',
  'reddit',
  'netflix',
  'prime video',
  'hotstar',
  'cricket',
  'ipl',
  'gaming',
  'free fire',
  'pubg',
  'chess.com',
  'lichess',
  'meme',
  'reels',
  'shorts',
  'whatsapp',
  'telegram',
  '9gag',
  'spotify',
  'gaana',
];

// Browsers — need to also check their title
const BROWSER_APPS = [
  'chrome',
  'chrome.exe',
  'msedge',
  'msedge.exe',
  'firefox',
  'firefox.exe',
  'brave',
  'brave.exe',
  'opera',
  'opera.exe',
];

/**
 * Classify student engagement state.
 * @param {number} idleMs     - System idle time in milliseconds
 * @param {string} appName    - Active window process name (lowercase)
 * @param {string} title      - Active window title (lowercase)
 * @returns {'active'|'idle'|'off-task'}
 */
function classify(idleMs, appName, title) {
  const app   = (appName || '').toLowerCase();
  const ttl   = (title   || '').toLowerCase();

  // 1. Long idle → Off-task regardless of window
  if (idleMs >= OFFTASK_THRESHOLD_MS) {
    return 'off-task';
  }

  // 2. Short-ish idle → Idle
  if (idleMs >= IDLE_THRESHOLD_MS) {
    return 'idle';
  }

  // 3. Active: check which app is in foreground
  const isCoding  = CODING_APPS.some(a => app.includes(a));
  const isBrowser = BROWSER_APPS.some(a => app.includes(a));
  const isDistractedTitle = OFFTASK_TITLE_KEYWORDS.some(k => ttl.includes(k));

  if (isCoding) return 'active';

  if (isBrowser && isDistractedTitle) return 'off-task';

  // 4. Default: they're doing something with keyboard/mouse
  return 'active';
}

module.exports = { classify };
