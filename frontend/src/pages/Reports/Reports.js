import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const Reports = () => {
  const [reportType, setReportType] = useState('dashboard');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (reportType === 'dashboard') {
      fetchDashboardReport();
    }
  }, [reportType]);

  const fetchDashboardReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/dashboard');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await api.get(`/reports/students?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching student report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await api.get(`/reports/instructors?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching instructor report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await api.get(`/reports/financial?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await api.get(`/reports/attendance?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    setReportData(null);
  };

  const renderReport = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!reportData) {
      return <div>Select a report type and click "Generate Report"</div>;
    }

    switch (reportType) {
      case 'dashboard':
        return (
          <div className="report-section">
            <h2>Dashboard Summary</h2>
            <div className="report-stats">
              <div className="stat-item">
                <strong>Total Students:</strong> {reportData.totalStudents}
              </div>
              <div className="stat-item">
                <strong>Active Students:</strong> {reportData.activeStudents}
              </div>
              <div className="stat-item">
                <strong>Instructors:</strong> {reportData.totalInstructors}
              </div>
              <div className="stat-item">
                <strong>Total Revenue:</strong> ₹{reportData.totalRevenue?.toFixed(2)}
              </div>
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="report-section">
            <h2>Student Report</h2>
            <div className="report-stats">
              <div className="stat-item">
                <strong>Total Enrolled:</strong> {reportData.statistics?.totalEnrolled}
              </div>
              <div className="stat-item">
                <strong>Active:</strong> {reportData.statistics?.activeStudents}
              </div>
              <div className="stat-item">
                <strong>Total Revenue:</strong> ₹{reportData.statistics?.totalRevenue?.toFixed(2)}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.students?.slice(0, 10).map((student) => (
                  <tr key={student._id}>
                    <td>{student.userId?.name}</td>
                    <td>{student.userId?.email}</td>
                    <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                    <td>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'instructors':
        return (
          <div className="report-section">
            <h2>Instructor Report</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Total Schedules</th>
                  <th>Completed</th>
                  <th>Present</th>
                  <th>Absent</th>
                </tr>
              </thead>
              <tbody>
                {reportData.instructors?.map((instructor) => (
                  <tr key={instructor._id}>
                    <td>{instructor.userId?.name}</td>
                    <td>{instructor.employeeId}</td>
                    <td>{instructor.statistics?.totalSchedules}</td>
                    <td>{instructor.statistics?.completedSchedules}</td>
                    <td>{instructor.statistics?.presentCount}</td>
                    <td>{instructor.statistics?.absentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'financial':
        return (
          <div className="report-section">
            <h2>Financial Report</h2>
            <div className="report-stats">
              <div className="stat-item">
                <strong>Total Revenue:</strong> ₹{reportData.summary?.totalRevenue?.toFixed(2)}
              </div>
              <div className="stat-item">
                <strong>Total Invoiced:</strong> ₹{reportData.summary?.totalInvoiced?.toFixed(2)}
              </div>
              <div className="stat-item">
                <strong>Outstanding:</strong> ₹{reportData.summary?.outstanding?.toFixed(2)}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="report-section">
            <h2>Attendance Report</h2>
            <div className="report-stats">
              <div className="stat-item">
                <strong>Total Records:</strong> {reportData.statistics?.total}
              </div>
              <div className="stat-item">
                <strong>Present:</strong> {reportData.statistics?.breakdown?.present || 0}
              </div>
              <div className="stat-item">
                <strong>Absent:</strong> {reportData.statistics?.breakdown?.absent || 0}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.attendance?.slice(0, 20).map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.studentId?.userId?.name || 'N/A'}</td>
                    <td>{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Reports</h1>
        <div className="report-controls">
          <div className="report-type-selector">
            <button
              className={reportType === 'dashboard' ? 'active' : ''}
              onClick={() => handleReportTypeChange('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={reportType === 'students' ? 'active' : ''}
              onClick={() => handleReportTypeChange('students')}
            >
              Students
            </button>
            <button
              className={reportType === 'instructors' ? 'active' : ''}
              onClick={() => handleReportTypeChange('instructors')}
            >
              Instructors
            </button>
            <button
              className={reportType === 'financial' ? 'active' : ''}
              onClick={() => handleReportTypeChange('financial')}
            >
              Financial
            </button>
            <button
              className={reportType === 'attendance' ? 'active' : ''}
              onClick={() => handleReportTypeChange('attendance')}
            >
              Attendance
            </button>
          </div>
          <div className="report-filters">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Start Date"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="End Date"
            />
            <button
              onClick={() => {
                if (reportType === 'students') fetchStudentReport();
                else if (reportType === 'instructors') fetchInstructorReport();
                else if (reportType === 'financial') fetchFinancialReport();
                else if (reportType === 'attendance') fetchAttendanceReport();
              }}
              className="btn-primary"
            >
              Generate Report
            </button>
          </div>
        </div>
        {renderReport()}
      </div>
    </div>
  );
};

export default Reports;

