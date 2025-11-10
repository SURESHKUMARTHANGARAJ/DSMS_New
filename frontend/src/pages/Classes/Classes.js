import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    fees: 0,
    maxStudents: 10,
    instructor: '',
    status: 'active',
  });

  useEffect(() => {
    fetchClasses();
    fetchInstructors();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
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
      await api.post('/classes', formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        duration: 60,
        fees: 0,
        maxStudents: 10,
        instructor: '',
        status: 'active',
      });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class: ' + (error.response?.data?.message || 'Unknown error'));
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
          <h1>Classes</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            Add Class
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Create New Class</h2>
            <div className="form-group">
              <label>Class Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Fees (₹)</label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Instructor</label>
              <select
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
              >
                <option value="">Select Instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.userId?.name || instructor.employeeId}
                  </option>
                ))}
              </select>
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
              <th>Name</th>
              <th>Duration</th>
              <th>Fees</th>
              <th>Max Students</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem._id}>
                <td>{classItem.name}</td>
                <td>{classItem.duration} min</td>
                <td>₹{classItem.fees}</td>
                <td>{classItem.maxStudents}</td>
                <td>{classItem.instructor?.userId?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${classItem.status}`}>
                    {classItem.status}
                  </span>
                </td>
                <td>
                  <button className="btn-link">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classes;

