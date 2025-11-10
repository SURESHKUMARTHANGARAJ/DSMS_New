import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import Students from './pages/Students/Students';
import StudentEnrollment from './pages/Students/StudentEnrollment';
import Instructors from './pages/Instructors/Instructors';
import Classes from './pages/Classes/Classes';
import Schedules from './pages/Schedules/Schedules';
import Payments from './pages/Payments/Payments';
import Invoices from './pages/Invoices/Invoices';
import Attendance from './pages/Attendance/Attendance';
import Reports from './pages/Reports/Reports';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/enroll" element={<StudentEnrollment />} />
              <Route path="instructors" element={<Instructors />} />
              <Route path="classes" element={<Classes />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="payments" element={<Payments />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </PrivateRoute>
        }
      />

      <Route
        path="/instructor/*"
        element={
          <PrivateRoute allowedRoles={['instructor']}>
            <Routes>
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="students" element={<Students />} />
              <Route path="*" element={<Navigate to="/instructor/dashboard" />} />
            </Routes>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <PrivateRoute allowedRoles={['student']}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="payments" element={<Payments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="*" element={<Navigate to="/student/dashboard" />} />
            </Routes>
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

