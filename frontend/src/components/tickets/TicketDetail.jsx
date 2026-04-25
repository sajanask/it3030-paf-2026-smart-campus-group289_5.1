import React, { useState, useEffect, useCallback } from 'react'
import {
  fetchTicket, assignTicket, updateStatus,
  rejectTicket, closeTicket,
  addComment, editComment, deleteComment,
} from '../../services/api'
import './TicketDetail.css'

const TicketDetail = ({ ticketId, onClose, onUpdated }) => {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchTicket(ticketId)
      setTicket(data)
    } catch (e) {
      console.error('Failed to load ticket:', e)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => { loadTicket() }, [loadTicket])

  if (loading) return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-loader"><div className="spinner"/></div>
    </div>
  )

  if (!ticket) return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-loader">
        <div className="alert alert-danger">Ticket not found.</div>
      </div>
    </div>
  )

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Ticket #{ticket.id}</h2>
            <p>{ticket.title}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="detail-section">
            <h3>Details</h3>
            <p><strong>Title:</strong> {ticket.title}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Category:</strong> {ticket.category}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Reported by:</strong> {ticket.reportedBy}</p>
            {ticket.assignedTo && <p><strong>Assigned to:</strong> {ticket.assignedTo}</p>}
            {ticket.resolutionNotes && <p><strong>Resolution:</strong> {ticket.resolutionNotes}</p>}
          </div>

          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="detail-section">
              <h3>Images</h3>
              <div className="images-grid">
                {ticket.imageUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Ticket ${ticket.id} image ${i+1}`} style={{ maxWidth: '200px' }} />
                ))}
              </div>
            </div>
          )}

          {ticket.comments && ticket.comments.length > 0 && (
            <div className="detail-section">
              <h3>Comments ({ticket.comments.length})</h3>
              {ticket.comments.map(c => (
                <div key={c.id} className="comment-item">
                  <strong>{c.author}</strong> <small>({c.authorRole})</small>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
