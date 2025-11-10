import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    employeeId: '',
    specialization: '',
    licenseNumber: '',
    experience: 0,
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors');
      setInstructors(response.data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
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
      await api.post('/instructors', formData);
      setShowForm(false);
      setFormData({
        userId: '',
        employeeId: '',
        specialization: '',
        licenseNumber: '',
        experience: 0,
      });
      fetchInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      alert('Error creating instructor: ' + (error.response?.data?.message || 'Unknown error'));
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
          <h1>Instructors</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            Add Instructor
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Add New Instructor</h2>
            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
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
              <th>Name</th>
              <th>Email</th>
              <th>Employee ID</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.userId?.name || 'N/A'}</td>
                <td>{instructor.userId?.email || 'N/A'}</td>
                <td>{instructor.employeeId}</td>
                <td>{instructor.specialization || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${instructor.status}`}>
                    {instructor.status}
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

export default Instructors;

