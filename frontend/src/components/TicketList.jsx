import React, { useState, useEffect } from 'react';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterAndSortTickets();
  }, [tickets, activeFilter, searchTerm, sortBy]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTickets = () => {
    let filtered = [...tickets];

    // Filter by status
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(ticket =>
        ticket.status.includes(activeFilter.replace(/_/g, ' '))
      );
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          return getPriorityValue(b.priority) - getPriorityValue(a.priority);
        default:
          return 0;
      }
    });

    setFilteredTickets(filtered);
  };

  const getPriorityValue = (priority) => {
    const priorityMap = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityMap[priority.split(' ')[0]] || 0;
  };

  const getStatusColor = (status) => {
    if (status.includes('Open')) return 'status-open';
    if (status.includes('In Progress')) return 'status-in-progress';
    if (status.includes('Resolved')) return 'status-resolved';
    if (status.includes('Rejected')) return 'status-rejected';
    return 'status-closed';
  };

  const getPriorityBadgeClass = (priority) => {
    const basePriority = priority.split(' ')[0];
    if (basePriority === 'Critical') return 'badge-danger';
    if (basePriority === 'High') return 'badge-warning';
    if (basePriority === 'Medium') return 'badge-primary';
    return 'badge-primary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterButtons = [
    { label: 'All Tickets', value: 'ALL' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <div className="header-content">
          <h1>🎟️ Ticket Management System</h1>
          <p className="subtitle">Track and manage all maintenance and incident tickets</p>
        </div>
      </div>

      <div className="ticket-list-content">
        {/* Search and Controls */}
        <div className="list-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search tickets by ID, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="controls-actions">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-tabs">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              className={`filter-btn ${activeFilter === btn.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Tickets Display */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-title">No tickets found</p>
            <p className="empty-text">
              {searchTerm || activeFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria'
                : 'Create a new ticket to get started'}
            </p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-title-section">
                    <span className="ticket-id">#{ticket.id}</span>
                    <h3>{ticket.title}</h3>
                  </div>
                  <div className="ticket-badges">
                    <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <p className="ticket-status"><span className={getStatusColor(ticket.status)}>●</span> {ticket.status}</p>

                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-meta">
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{ticket.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Reported by:</span>
                    <span className="meta-value">{ticket.reportedBy}</span>
                  </div>
                </div>

                <div className="ticket-dates">
                  <small className="date-created">Created: {formatDate(ticket.createdAt)}</small>
                  {ticket.resolvedAt && (
                    <small className="date-resolved">Resolved: {formatDate(ticket.resolvedAt)}</small>
                  )}
                </div>

                {ticket.assignedTo && (
                  <div className="ticket-assignee">
                    <span className="assignee-label">Assigned to:</span>
                    <span className="assignee-name">{ticket.assignedTo}</span>
                  </div>
                )}

                {ticket.resolutionNotes && (
                  <div className="resolution-notes">
                    <strong>Resolution Notes:</strong>
                    <p>{ticket.resolutionNotes}</p>
                  </div>
                )}

                <div className="ticket-actions">
                  <button className="action-btn view-btn">View Details</button>
                  {ticket.status === 'Open - Awaiting Technician' && (
                    <button className="action-btn assign-btn">Assign</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="list-stats">
          <div className="stat">
            <span className="stat-number">{tickets.length}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {tickets.filter(t => t.status.includes('Open')).length}
            </span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {tickets.filter(t => t.status.includes('In Progress')).length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {tickets.filter(t => t.status.includes('Resolved')).length}
            </span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
