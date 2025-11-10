import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const response = await api.get(`/students/${user.id}`);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
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
        <h1>Student Dashboard</h1>
        <div className="dashboard-grid">
          <div className="info-card">
            <h3>Enrollment Status</h3>
            <p>{studentData?.status || 'N/A'}</p>
          </div>
          <div className="info-card">
            <h3>Enrolled Classes</h3>
            <p>{studentData?.enrolledClasses?.length || 0}</p>
          </div>
          <div className="info-card">
            <h3>Total Paid</h3>
            <p>₹{studentData?.totalPaid?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="info-card">
            <h3>Outstanding</h3>
            <p>₹{studentData?.outstanding?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/student/schedules" className="btn-primary">View Schedules</Link>
            <Link to="/student/payments" className="btn-primary">View Payments</Link>
            <Link to="/student/attendance" className="btn-primary">View Attendance</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

