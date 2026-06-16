// pages/RolePicker.jsx  –  Entry screen
import { useState } from 'react';
import { GraduationCap, Monitor, ArrowRight, Eye } from 'lucide-react';
import './RolePicker.css';

export default function RolePicker({ onSelect }) {
  const [role,    setRole]    = useState(null);
  const [name,    setName]    = useState('');
  const [seat,    setSeat]    = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onSelect({ role, name: name.trim(), seat: seat.trim() });
    }, 600);
  }

  return (
    <div className="role-picker">
      {/* Background blobs */}
      <div className="role-picker__blob role-picker__blob--1" />
      <div className="role-picker__blob role-picker__blob--2" />

      <div className="role-picker__card glass-card animate-scaleIn">
        {/* Logo */}
        <div className="role-picker__logo">
          <Monitor size={28} />
        </div>
        <h1 className="role-picker__title">EngageTrack</h1>
        <p className="role-picker__subtitle">Real-Time Student Engagement Monitor</p>

        {!role ? (
          <div className="role-picker__roles animate-slideUp">
            <p className="role-picker__prompt">Select your role to continue</p>
            <div className="role-picker__role-grid">
              <button className="role-card" onClick={() => setRole('faculty')}>
                <div className="role-card__icon role-card__icon--faculty">
                  <Eye size={24} />
                </div>
                <span className="role-card__title">Faculty</span>
                <span className="role-card__desc">Monitor student engagement</span>
              </button>

              <button className="role-card" onClick={() => setRole('student')}>
                <div className="role-card__icon role-card__icon--student">
                  <GraduationCap size={24} />
                </div>
                <span className="role-card__title">Student</span>
                <span className="role-card__desc">View your engagement status</span>
              </button>
            </div>
          </div>
        ) : (
          <form className="role-picker__form animate-slideUp" onSubmit={handleSubmit}>
            <p className="role-picker__prompt">
              Continuing as <strong>{role === 'faculty' ? 'Faculty' : 'Student'}</strong>
              <button type="button" className="role-picker__back" onClick={() => setRole(null)}>
                Change
              </button>
            </p>

            <div className="role-picker__fields">
              <div className="form-group">
                <label className="form-label">
                  {role === 'faculty' ? 'Faculty Name' : 'Full Name'}
                </label>
                <input
                  className="input"
                  placeholder={role === 'faculty' ? 'Dr. Sharma' : 'Rahul Verma'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Seat / Roll No.</label>
                  <input
                    className="input"
                    placeholder="e.g. A-12 or 21CS045"
                    value={seat}
                    onChange={e => setSeat(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : (
                <>
                  {role === 'faculty' ? 'Open Dashboard' : 'View My Status'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
