import React, { useState, useEffect } from 'react';
import './TicketDetail.css';

const TicketDetail = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [actionForm, setActionForm] = useState({
    action: '',
    technicianId: '',
    notes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Failed to fetch ticket');
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionForm.action) return;

    try {
      setUpdating(true);
      let url = `http://localhost:8080/api/tickets/${ticketId}/`;
      let params = new URLSearchParams();

      if (actionForm.action === 'assign') {
        url += `assign?technicianId=${actionForm.technicianId}`;
      } else if (actionForm.action === 'status_update') {
        url += `status?status=${actionForm.status}&notes=${actionForm.notes}`;
      } else if (actionForm.action === 'reject') {
        url += `reject?reason=${actionForm.rejectionReason}`;
      }

      const response = await fetch(url, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to update ticket');

      const updated = await response.json();
      setTicket(updated);
      setActionForm({ action: '', technicianId: '', notes: '', rejectionReason: '' });
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="modal-backdrop"><div className="loading-spinner"></div></div>;
  }

  if (!ticket) {
    return <div className="modal-backdrop"><div className="error-message">Ticket not found</div></div>;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Ticket #{ticket.id}</h2>
            <span className={`modal-status ${ticket.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {ticket.status}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${selectedTab === 'details' ? 'active' : ''}`}
            onClick={() => setSelectedTab('details')}
          >
            Details
          </button>
          <button
            className={`tab ${selectedTab === 'actions' ? 'active' : ''}`}
            onClick={() => setSelectedTab('actions')}
          >
            Actions
          </button>
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <button
              className={`tab ${selectedTab === 'images' ? 'active' : ''}`}
              onClick={() => setSelectedTab('images')}
            >
              Images ({ticket.imageUrls.length})
            </button>
          )}
        </div>

        <div className="modal-content">
          {selectedTab === 'details' && (
            <div className="details-tab">
              <div className="detail-section">
                <h3>Issue Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{ticket.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <p className="detail-value full">{ticket.description}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Classification</h3>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{ticket.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className={`detail-badge ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Assignment & Status</h3>
                <div className="detail-row">
                  <span className="detail-label">Reported by:</span>
                  <span className="detail-value">{ticket.reportedBy}</span>
                </div>
                {ticket.assignedTo && (
                  <div className="detail-row">
                    <span className="detail-label">Assigned to:</span>
                    <span className="detail-value">{ticket.assignedTo}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Timeline</h3>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Updated:</span>
                  <span className="detail-value">{formatDate(ticket.updatedAt)}</span>
                </div>
                {ticket.resolvedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Resolved:</span>
                    <span className="detail-value">{formatDate(ticket.resolvedAt)}</span>
                  </div>
                )}
              </div>

              {ticket.resolutionNotes && (
                <div className="detail-section">
                  <h3>Resolution Notes</h3>
                  <div className="resolution-box">{ticket.resolutionNotes}</div>
                </div>
              )}

              {ticket.rejectionReason && (
                <div className="detail-section">
                  <h3>Rejection Reason</h3>
                  <div className="rejection-box">{ticket.rejectionReason}</div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'actions' && (
            <div className="actions-tab">
              <div className="action-section">
                <h3>Ticket Actions</h3>

                {ticket.status.includes('Open') && (
                  <div className="action-form-group">
                    <label>Assign to Technician</label>
                    <input
                      type="text"
                      placeholder="Enter technician ID"
                      value={actionForm.technicianId}
                      onChange={(e) => setActionForm({ ...actionForm, technicianId: e.target.value, action: 'assign' })}
                    />
                    <button
                      className="btn btn-primary action-submit"
                      onClick={handleAction}
                      disabled={!actionForm.technicianId || updating}
                    >
                      {updating ? 'Assigning...' : 'Assign Ticket'}
                    </button>
                  </div>
                )}

                {(ticket.status.includes('Open') || ticket.status.includes('In Progress')) && (
                  <>
                    <div className="action-form-group">
                      <label>Update Status</label>
                      <select
                        value={actionForm.status || ''}
                        onChange={(e) => setActionForm({ ...actionForm, status: e.target.value, action: 'status_update' })}
                      >
                        <option value="">Select new status</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <textarea
                        placeholder="Add resolution notes (optional)"
                        value={actionForm.notes}
                        onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                      />
                      <button
                        className="btn btn-success action-submit"
                        onClick={handleAction}
                        disabled={!actionForm.status || updating}
                      >
                        {updating ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>

                    <div className="action-form-group">
                      <label>Reject Ticket</label>
                      <textarea
                        placeholder="Reason for rejection"
                        value={actionForm.rejectionReason}
                        onChange={(e) => setActionForm({ ...actionForm, rejectionReason: e.target.value, action: 'reject' })}
                      />
                      <button
                        className="btn btn-danger action-submit"
                        onClick={handleAction}
                        disabled={!actionForm.rejectionReason || updating}
                      >
                        {updating ? 'Rejecting...' : 'Reject Ticket'}
                      </button>
                    </div>
                  </>
                )}

                {(ticket.status.includes('Resolved') || ticket.status.includes('Rejected')) && (
                  <button className="btn btn-secondary action-submit" disabled>
                    No actions available - Ticket closed
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'images' && ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="images-tab">
              <div className="images-grid">
                {ticket.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="image-container">
                    <img src={imageUrl} alt={`Ticket attachment ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;

function getPriorityClass(priority) {
  const basePriority = priority.split(' ')[0];
  if (basePriority === 'Critical') return 'priority-critical';
  if (basePriority === 'High') return 'priority-high';
  if (basePriority === 'Medium') return 'priority-medium';
  return 'priority-low';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
