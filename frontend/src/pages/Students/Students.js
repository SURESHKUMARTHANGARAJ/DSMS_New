import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
        <div className="page-header">
          <h1>Students</h1>
          <Link to="/admin/students/enroll" className="btn-primary">Enroll New Student</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.userId?.name || 'N/A'}</td>
                <td>{student.userId?.email || 'N/A'}</td>
                <td>{student.userId?.phone || 'N/A'}</td>
                <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/students/${student.userId._id}`} className="btn-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;

