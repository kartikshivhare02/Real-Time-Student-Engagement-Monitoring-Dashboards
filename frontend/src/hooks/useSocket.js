// hooks/useSocket.js  –  Socket.IO client hook
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useSocket(role) {
  const socketRef    = useRef(null);
  const [connected, setConnected]   = useState(false);
  const [students,  setStudents]    = useState([]);
  const [analytics, setAnalytics]  = useState(null);
  const [alerts,    setAlerts]     = useState([]);

  const dismissAlert = useCallback((studentId) => {
    setAlerts(prev => prev.filter(a => a.studentId !== studentId));
    socketRef.current?.emit('faculty:dismiss_alert', { studentId });
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (role === 'faculty') socket.emit('faculty:register');
    });

    socket.on('disconnect', () => setConnected(false));

    // Initial snapshot (sent right after faculty registers)
    socket.on('dashboard:snapshot', ({ students, analytics }) => {
      setStudents(students);
      setAnalytics(analytics);
    });

    // Live student updates
    socket.on('dashboard:update', ({ type, data }) => {
      setStudents(prev => {
        const idx = prev.findIndex(s => s.id === data?.id);
        if (type === 'student_disconnected' || type === 'student_update') {
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data;
            return next;
          }
          return data ? [...prev, data] : prev;
        }
        if (type === 'student_joined') {
          if (idx >= 0) return prev; // already listed
          return data ? [...prev, data] : prev;
        }
        return prev;
      });
    });

    // Analytics broadcast every 10s
    socket.on('dashboard:analytics', setAnalytics);

    // Alerts
    socket.on('dashboard:alert', (alert) => {
      setAlerts(prev => {
        const exists = prev.find(a => a.studentId === alert.studentId);
        if (exists) return prev.map(a => a.studentId === alert.studentId ? alert : a);
        return [alert, ...prev].slice(0, 20); // cap at 20 alerts
      });
    });

    return () => socket.disconnect();
  }, [role]);

  return { connected, students, analytics, alerts, dismissAlert };
}
