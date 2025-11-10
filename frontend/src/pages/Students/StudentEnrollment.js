import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const StudentEnrollment = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    dateOfBirth: '',
  });
  const [aadharCard, setAadharCard] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users-for-enrollment');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'aadhar') {
      setAadharCard(file);
    } else if (type === 'pan') {
      setPanCard(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', formData.userId);
      if (formData.dateOfBirth) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      }
      formDataToSend.append('address', JSON.stringify(formData.address));
      if (aadharCard) {
        formDataToSend.append('aadharCard', aadharCard);
      }
      if (panCard) {
        formDataToSend.append('panCard', panCard);
      }

      await api.post('/students', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/admin/students');
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Error enrolling student: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Enroll New Student</h1>
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>User</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="form-section">
            <h3>Address</h3>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-section">
            <h3>Documents</h3>
            <div className="form-group">
              <label>Aadhar Card</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, 'aadhar')}
              />
            </div>
            <div className="form-group">
              <label>PAN Card</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, 'pan')}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentEnrollment;

