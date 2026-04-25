import React, { useState } from 'react';
import './TicketForm.css';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'HARDWARE',
    priority: 'MEDIUM',
    reportedBy: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    { value: 'HARDWARE', label: 'Hardware Issues' },
    { value: 'PLUMBING', label: 'Plumbing Issues' },
    { value: 'ELECTRICAL', label: 'Electrical Issues' },
    { value: 'CLEANING', label: 'Cleaning & Maintenance' },
    { value: 'SECURITY', label: 'Security Issues' },
    { value: 'INTERNET', label: 'Internet/Network Issues' },
    { value: 'FURNITURE', label: 'Furniture & Fixtures' },
    { value: 'OTHER', label: 'Other' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 images
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('reportedBy', formData.reportedBy);

      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      const result = await response.json();
      setSuccessMessage(`Ticket #${result.id} submitted successfully!`);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        reportedBy: '',
        images: []
      });

      // Clear file input
      document.getElementById('imageInput').value = '';

    } catch (error) {
      setErrorMessage(error.message || 'Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-form-container">
      <div className="ticket-form-card">
        <div className="card-header">
          <h2>📋 Report an Incident</h2>
          <p className="subtitle">Help us fix issues faster with detailed information</p>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger">
            ✗ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-content">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title of the issue"
              required
              maxLength="100"
            />
            <small className="char-count">{formData.title.length}/100</small>
          </div>

          {/* Your Name/ID */}
          <div className="form-group">
            <label htmlFor="reportedBy">Your Name/ID *</label>
            <input
              type="text"
              id="reportedBy"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleInputChange}
              placeholder="e.g., John Doe or Student ID"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail. What's broken? When did it happen?"
              required
              maxLength="1000"
            />
            <small className="char-count">{formData.description.length}/1000</small>
          </div>

          {/* Category and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                {priorities.map(pri => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="imageInput">Attach Photos (Optional - Max 3)</label>
            <div className="file-upload">
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => document.getElementById('imageInput').click()}
              >
                📷 Choose Images
              </button>
              {formData.images.length > 0 && (
                <div className="image-preview">
                  <p className="image-count">
                    {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="image-list">
                    {Array.from(formData.images).map((file, index) => (
                      <div key={index} className="image-item">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Ticket'}
            </button>
            <p className="help-text">
              📌 Your ticket will be reviewed by our maintenance team
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
