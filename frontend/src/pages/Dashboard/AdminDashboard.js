import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
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
        <h1>Admin Dashboard</h1>
        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-number">{summary?.totalStudents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Students</h3>
            <p className="stat-number">{summary?.activeStudents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Instructors</h3>
            <p className="stat-number">{summary?.totalInstructors || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Classes</h3>
            <p className="stat-number">{summary?.totalClasses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Schedules</h3>
            <p className="stat-number">{summary?.todaySchedules || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{summary?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Invoices</h3>
            <p className="stat-number">{summary?.pendingInvoices || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

