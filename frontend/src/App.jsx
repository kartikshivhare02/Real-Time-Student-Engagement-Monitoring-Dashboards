// App.jsx  –  Root application with routing
import { useState } from 'react';
import RolePicker       from './pages/RolePicker';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentView      from './pages/StudentView';

export default function App() {
  const [user, setUser] = useState(null); // { role, name, seat }

  function handleSelect(userData) {
    setUser(userData);
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <RolePicker onSelect={handleSelect} />;
  }

  if (user.role === 'faculty') {
    return <FacultyDashboard user={user} onLogout={handleLogout} />;
  }

  return <StudentView user={user} onLogout={handleLogout} />;
}
