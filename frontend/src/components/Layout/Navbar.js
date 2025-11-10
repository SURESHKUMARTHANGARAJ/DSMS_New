import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRolePath = (role) => {
    return `/${role}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={`${getRolePath(user?.role)}/dashboard`}>Driving School</Link>
        </div>
        <div className="navbar-menu">
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/students">Students</Link>
              <Link to="/admin/instructors">Instructors</Link>
              <Link to="/admin/classes">Classes</Link>
              <Link to="/admin/schedules">Schedules</Link>
              <Link to="/admin/payments">Payments</Link>
              <Link to="/admin/invoices">Invoices</Link>
              <Link to="/admin/attendance">Attendance</Link>
              <Link to="/admin/reports">Reports</Link>
            </>
          )}
          {user?.role === 'instructor' && (
            <>
              <Link to="/instructor/schedules">Schedules</Link>
              <Link to="/instructor/attendance">Attendance</Link>
              <Link to="/instructor/students">Students</Link>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <Link to="/student/schedules">My Schedules</Link>
              <Link to="/student/payments">Payments</Link>
              <Link to="/student/attendance">Attendance</Link>
            </>
          )}
          <div className="navbar-user">
            <span>{user?.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

