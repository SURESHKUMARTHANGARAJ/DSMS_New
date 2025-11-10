import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Schedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    instructorId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchSchedules();
    if (user?.role === 'admin') {
      fetchStudents();
      fetchClasses();
      fetchInstructors();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      let url = '/schedules';
      if (user?.role === 'student') {
        // Fetch student's own schedules
        const studentResponse = await api.get(`/students/${user.id}`);
        if (studentResponse.data?._id) {
          url = `/schedules?studentId=${studentResponse.data._id}`;
        }
      } else if (user?.role === 'instructor') {
        // Fetch instructor's schedules
        const instructorResponse = await api.get(`/instructors/${user.id}`);
        if (instructorResponse.data?._id) {
          url = `/schedules?instructorId=${instructorResponse.data._id}`;
        }
      }
      const response = await api.get(url);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
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
      await api.post('/schedules', formData);
      setShowForm(false);
      setFormData({
        studentId: '',
        classId: '',
        instructorId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule: ' + (error.response?.data?.message || 'Unknown error'));
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
          <h1>Schedules</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              Create Schedule
            </button>
          )}
        </div>
        {showForm && user?.role === 'admin' && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Create New Schedule</h2>
            <div className="form-group">
              <label>Student</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
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
              <label>Class</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Instructor</label>
              <select
                name="instructorId"
                value={formData.instructorId}
                onChange={handleChange}
                required
              >
                <option value="">Select Instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.userId?.name || instructor.employeeId}
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
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
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
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </form>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Student</th>
              <th>Class</th>
              <th>Instructor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td>{new Date(schedule.date).toLocaleDateString()}</td>
                <td>{schedule.startTime} - {schedule.endTime}</td>
                <td>{schedule.studentId?.userId?.name || 'N/A'}</td>
                <td>{schedule.classId?.name || 'N/A'}</td>
                <td>{schedule.instructorId?.userId?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${schedule.status}`}>
                    {schedule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedules;

