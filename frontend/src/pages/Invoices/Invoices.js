import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    totalAmount: 0,
    dueDate: '',
  });

  useEffect(() => {
    fetchInvoices();
    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      let url = '/invoices';
      if (user?.role === 'student') {
        const studentResponse = await api.get(`/students/${user.id}`);
        if (studentResponse.data?._id) {
          url = `/invoices?studentId=${studentResponse.data._id}`;
        }
      }
      const response = await api.get(url);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].total = items[index].quantity * items[index].unitPrice;
    }
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    setFormData({
      ...formData,
      items,
      totalAmount,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    setFormData({
      ...formData,
      items,
      totalAmount,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      setShowForm(false);
      setFormData({
        studentId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        totalAmount: 0,
        dueDate: '',
      });
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
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
          <h1>Invoices</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              Create Invoice
            </button>
          )}
        </div>
        {showForm && user?.role === 'admin' && (
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Create Invoice</h2>
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
              <label>Items</label>
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                  <span>₹{item.total.toFixed(2)}</span>
                  <button type="button" onClick={() => removeItem(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn-secondary">Add Item</button>
            </div>
            <div className="form-group">
              <label>Total Amount: ₹{formData.totalAmount.toFixed(2)}</label>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
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
              <th>Invoice Number</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.studentId?.userId?.name || 'N/A'}</td>
                <td>₹{invoice.totalAmount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${invoice.status}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>{new Date(invoice.generatedDate).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => downloadInvoice(invoice._id)}
                    className="btn-link"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;

