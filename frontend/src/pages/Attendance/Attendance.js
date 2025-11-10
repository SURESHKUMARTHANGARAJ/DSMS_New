import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    scheduleId: '',
    instructorId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });

  useEffect(() => {
    fetchAttendance();
    if (user?.role === 'admin' || user?.role === 'instructor') {
      fetchStudents();
      fetchSchedules();
      fetchInstructors();
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      let url = '/attendance';
      if (user?.role === 'student') {
        const studentResponse = await api.get(`/students/${user.id}`);
        if (studentResponse.data?._id) {
          url = `/attendance?studentId=${studentResponse.data._id}`;
        }
      } else if (user?.role === 'instructor') {
        const instructorResponse = await api.get(`/instructors/${user.id}`);
        if (instructorResponse.data?._id) {
          url = `/attendance?instructorId=${instructorResponse.data._id}`;
        }
      }
      const response = await api.get(url);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors');
      setInstructors(response.data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      setShowForm(false);
      setFormData({
        studentId: '',
        scheduleId: '',
        instructorId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: '',
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance: ' + (error.response?.data?.message || 'Unknown error'));
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
        <div className="page-header">
          <h1>Attendance</h1>
          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              Mark Attendance
            </button>
          )}
        </div>
        {showForm && (user?.role === 'admin' || user?.role === 'instructor') && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Mark Attendance</h2>
            <div className="form-group">
              <label>Student</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.userId?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Schedule (Optional)</label>
              <select
                name="scheduleId"
                value={formData.scheduleId}
                onChange={handleChange}
              >
                <option value="">None</option>
                {schedules.map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>
                    {new Date(schedule.date).toLocaleDateString()} - {schedule.classId?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary">Mark</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </form>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Class</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Login Time</th>
              <th>Logout Time</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.studentId?.userId?.name || 'N/A'}</td>
                <td>{record.scheduleId?.classId?.name || 'N/A'}</td>
                <td>{record.instructorId?.userId?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${record.status}`}>
                    {record.status}
                  </span>
                </td>
                <td>
                  {record.loginTime
                    ? new Date(record.loginTime).toLocaleTimeString()
                    : 'N/A'}
                </td>
                <td>
                  {record.logoutTime
                    ? new Date(record.logoutTime).toLocaleTimeString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

