# Real-Time-Student-Engagement-Monitoring-Dashboards
A real-time student engagement monitoring system that analyzes student interactions and visualizes engagement levels through an interactive dashboard for online and hybrid learning environments.
# EngageTrack — Real-Time Student Engagement Monitor
### College Lab Beta Deployment Guide
Dashboard Link-https://real-time-student-mon-dashboard.netlify.app/

Problem Statement

In modern learning environments, it is difficult for educators to manually track student engagement effectively. Traditional methods fail to provide real-time insights into student behavior and participation. This project addresses this gap by automating engagement monitoring using data analytics and visualization.

Features
1.Real-time student engagement tracking
2.Data preprocessing and cleaning
3.AI-based classification of engagement levels
4.Interactive dashboard for visualization
5.Structured storage of engagement data
6.Performance trend analysis over time

How It Works
1.Student activity data is collected from system logs
2.Data is cleaned and preprocessed for consistency
3.Engagement level is predicted using a classification approach
4.Results are stored in the database
5.Dashboard displays graphs and engagement insights
<img width="1600" height="760" alt="image" src="https://github.com/user-attachments/assets/6507cce6-51d8-45e6-bfd2-cb9d752c9d52" />


Results
Students are categorized into engagement levels (High / Medium / Low)
Visual analytics show participation trends
Reports help in understanding student behavior patterns

---

## 📁 Project Structure

```
minor 6th sem/
├── backend/     ← Server (runs on ONE PC — faculty/server PC)
├── agent/       ← Student agent (runs on EACH student PC)
└── frontend/    ← Web dashboard (served by backend, opened in browser)
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js v18+** installed on all PCs ([nodejs.org](https://nodejs.org))
- All PCs on the **same LAN/Wi-Fi** network

---

## Step 1 — Start the Backend Server (Faculty PC only)

```bash
cd "minor 6th sem/backend"
npm install
node server.js
```

When it starts, it will show:
```
║  Network: http://192.168.x.x:3001  ║
```

**Note this IP address** — you'll need it for Step 2.

---

## Step 2 — Configure Student Agents

On **each student PC**, open `agent/config.js` and change:

```js
SERVER_IP: '192.168.1.100',   // ← Replace with the IP from Step 1
```

---

## Step 3 — Start Agent on Student PCs

Students simply **double-click `agent/start.bat`**.

The first run will auto-install dependencies (takes ~30 seconds).  
Then the student enters their name and seat number.

---

## Step 4 — Open Faculty Dashboard

On the faculty PC (or any PC on the LAN), open a browser and go to:

```
http://localhost:3001      (on faculty PC)
http://192.168.x.x:3001   (on any other PC)
```

Select **Faculty** role and enter your name.

---

## 🎨 Color Coding

| Color | State | Meaning |
|---|---|---|
| 🟢 Green | Active | Working in VS Code, terminal, compiler, etc. |
| 🟡 Yellow | Idle | No keyboard/mouse for 2+ minutes |
| 🔴 Red | Off-task | Idle 5+ min, or YouTube/social media open |
| ⚫ Grey | Disconnected | Agent stopped/crashed |

---

## ⚙️ Customization

Edit `agent/classifier.js` to add more:
- **Coding apps** → goes in the `CODING_APPS` array
- **Distracting sites** → goes in the `OFFTASK_TITLE_KEYWORDS` array

Edit `agent/config.js` to change:
- `HEARTBEAT_INTERVAL_MS` — how often agents send updates (default: 5s)
- `IDLE_THRESHOLD_MS` — time before marking Idle (default: 2 min)
- `OFFTASK_THRESHOLD_MS` — time before marking Off-task (default: 5 min)

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| Agent can't connect | Check SERVER_IP in `agent/config.js`. Make sure the backend is running. |
| Student doesn't appear on dashboard | Wait 10s after agent starts. Check firewall allows port 3001. |
| `active-win` install error | Run `npm install --ignore-scripts` in the agent folder. |
| Port 3001 in use | Edit `backend/.env`: change `PORT=3001` to another port. |

---

## 📡 Port Firewall (Windows)

Run this on the **faculty/server PC** to allow incoming connections:

```powershell
netsh advfirewall firewall add rule name="EngageTrack" dir=in action=allow protocol=TCP localport=3001
```

---

## 👥 Team

Built as a Minor Project — 6th Semester  
Real-Time Student Engagement Monitoring Dashboard
