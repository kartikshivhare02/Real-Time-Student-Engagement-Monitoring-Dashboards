// pages/FacultyDashboard.jsx  –  Main faculty monitoring view
import { useState, useMemo } from 'react';
import {
  Wifi, WifiOff, RefreshCw, Filter, Search,
  LayoutGrid, List, Bell, LogOut, Monitor,
  TrendingUp
} from 'lucide-react';
import { useSocket }      from '../hooks/useSocket';
import StudentCard        from '../components/StudentCard';
import AnalyticsBar       from '../components/AnalyticsBar';
import AlertPanel         from '../components/AlertPanel';
import EngagementChart    from '../components/EngagementChart';
import './FacultyDashboard.css';

const FILTER_OPTIONS = ['all', 'active', 'idle', 'off-task', 'disconnected'];

export default function FacultyDashboard({ user, onLogout }) {
  const { connected, students, analytics, alerts, dismissAlert } = useSocket('faculty');
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');
  const [viewMode,   setViewMode]   = useState('grid'); // 'grid' | 'list'
  const [showAlerts, setShowAlerts] = useState(true);
  const [showChart,  setShowChart]  = useState(true);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchFilter = filter === 'all' || s.state === filter;
      const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase())
        || s.seat?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [students, filter, search]);

  return (
    <div className="dashboard">
      {/* ── Topbar ─────────────────────────────────────── */}
      <header className="dashboard__topbar">
        <div className="dashboard__brand">
          <Monitor size={20} />
          <span>EngageTrack</span>
          <span className="dashboard__badge">Faculty</span>
        </div>

        <div className="dashboard__connection">
          {connected
            ? <><span className="status-dot active" /><span className="text-xs">Live</span></>
            : <><span className="status-dot disconnected" /><span className="text-xs text-muted">Connecting…</span></>
          }
          {connected ? <Wifi size={14} className="conn-icon--live" /> : <WifiOff size={14} className="conn-icon--off" />}
        </div>

        <div className="dashboard__topbar-right">
          <span className="text-xs text-muted">
            Welcome, {user?.name}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onLogout} title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="dashboard__body">
        {/* ── Left: Main Content ─────────────────────── */}
        <main className="dashboard__main">

          {/* Analytics Bar */}
          <section className="dashboard__section">
            <AnalyticsBar analytics={analytics} />
          </section>

          {/* Chart (collapsible) */}
          <section className="dashboard__section dashboard__section--card">
            <div className="section-header" onClick={() => setShowChart(c => !c)} style={{ cursor: 'pointer' }}>
              <div className="section-header__left">
                <TrendingUp size={15} />
                <span>Engagement Trend</span>
              </div>
              <span className="text-xs text-muted">{showChart ? 'Hide' : 'Show'}</span>
            </div>
            {showChart && <EngagementChart analytics={analytics} />}
          </section>

          {/* Filter + Search Bar */}
          <div className="dashboard__toolbar">
            <div className="dashboard__search-wrap">
              <Search size={14} />
              <input
                className="dashboard__search"
                placeholder="Search by name or seat…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="dashboard__filters">
              <Filter size={13} style={{ color: 'var(--text-muted)' }} />
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f}
                  className={`filter-btn filter-btn--${f} ${filter === f ? 'filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'off-task' ? 'Off-task' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && analytics && (
                    <span className="filter-btn__count">
                      {f === 'active'       ? analytics.active
                      : f === 'idle'        ? analytics.idle
                      : f === 'off-task'    ? analytics.offTask
                      : f === 'disconnected' ? analytics.disconnected
                      : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="dashboard__view-toggle">
              <button
                className={`btn btn-ghost btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                className={`btn btn-ghost btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Student Grid / List */}
          <div className={viewMode === 'grid' ? 'student-grid' : 'student-list'}>
            {filtered.length === 0 ? (
              <div className="student-grid__empty">
                {connected
                  ? 'No students match your filter. Waiting for agents to connect…'
                  : 'Connecting to server…'
                }
              </div>
            ) : (
              filtered.map(s => (
                <StudentCard key={s.id} student={s} />
              ))
            )}
          </div>

        </main>

        {/* ── Right: Alert Panel ─────────────────────── */}
        <aside className={`dashboard__sidebar ${showAlerts ? '' : 'dashboard__sidebar--collapsed'}`}>
          <div className="sidebar-toggle" onClick={() => setShowAlerts(v => !v)}>
            <Bell size={14} />
            {alerts.length > 0 && <span className="sidebar-toggle__badge">{alerts.length}</span>}
            <span className="text-xs">Alerts</span>
          </div>
          {showAlerts && (
            <div className="sidebar-content glass-card">
              <AlertPanel alerts={alerts} onDismiss={dismissAlert} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
