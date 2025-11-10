import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/instructors/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await api.post('/attendance/instructor/login');
      fetchDashboardData();
    } catch (error) {
      console.error('Error recording login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/attendance/instructor/logout');
      fetchDashboardData();
    } catch (error) {
      console.error('Error recording logout:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Instructor Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={handleLogin} className="btn-primary">Record Login</button>
          <button onClick={handleLogout} className="btn-secondary">Record Logout</button>
        </div>
        <div className="dashboard-section">
          <h2>Today's Schedules</h2>
          {dashboardData?.todaySchedules?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.todaySchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td>{schedule.startTime} - {schedule.endTime}</td>
                    <td>{schedule.studentId?.userId?.name || 'N/A'}</td>
                    <td>{schedule.classId?.name || 'N/A'}</td>
                    <td>{schedule.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schedules for today</p>
          )}
        </div>
        <div className="dashboard-section">
          <h2>Upcoming Schedules</h2>
          {dashboardData?.upcomingSchedules?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.upcomingSchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td>{new Date(schedule.date).toLocaleDateString()}</td>
                    <td>{schedule.startTime} - {schedule.endTime}</td>
                    <td>{schedule.studentId?.userId?.name || 'N/A'}</td>
                    <td>{schedule.classId?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming schedules</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

