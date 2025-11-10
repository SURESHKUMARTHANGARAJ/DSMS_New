import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: '',
    invoiceId: '',
  });

  useEffect(() => {
    fetchPayments();
    if (user?.role === 'admin') {
      fetchStudents();
      fetchInvoices();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      let url = '/payments';
      if (user?.role === 'student') {
        const studentResponse = await api.get(`/students/${user.id}`);
        if (studentResponse.data?._id) {
          url = `/payments?studentId=${studentResponse.data._id}`;
        }
      }
      const response = await api.get(url);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
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

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
      await api.post('/payments', formData);
      setShowForm(false);
      setFormData({
        studentId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        description: '',
        invoiceId: '',
      });
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment: ' + (error.response?.data?.message || 'Unknown error'));
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
          <h1>Payments</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              Record Payment
            </button>
          )}
        </div>
        {showForm && user?.role === 'admin' && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Record Payment</h2>
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
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Invoice (Optional)</label>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
              >
                <option value="">None</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber} - ₹{invoice.totalAmount}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary">Record</button>
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
              <th>Amount</th>
              <th>Method</th>
              <th>Invoice</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td>{payment.studentId?.userId?.name || 'N/A'}</td>
                <td>₹{payment.amount.toFixed(2)}</td>
                <td>{payment.paymentMethod}</td>
                <td>{payment.invoiceId?.invoiceNumber || 'N/A'}</td>
                <td>{payment.description || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;

