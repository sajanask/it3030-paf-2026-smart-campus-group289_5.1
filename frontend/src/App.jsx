import { useState } from 'react'
import TicketList from './components/tickets/TicketList'
import TicketForm from './components/tickets/TicketForm'
import TicketDetail from './components/tickets/TicketDetail'
import './App.css'

function App() {
  const [view, setView] = useState('list')          // 'list' | 'form'
  const [selectedTicketId, setSelectedTicketId] = useState(null)

  const openDetail = (id) => setSelectedTicketId(id)
  const closeDetail = () => setSelectedTicketId(null)

  return (
    <div className="app-shell">
      {/* ── Top Nav ── */}
      <nav className="app-nav">
        <div className="nav-brand">
          <span className="nav-icon">🏛️</span>
          <span className="nav-title">Smart Campus</span>
          <span className="nav-sub">Operations Hub</span>
        </div>
        <div className="nav-links">
          <button
            className={`nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            📋 All Tickets
          </button>
          <button
            className={`nav-btn ${view === 'form' ? 'active' : ''}`}
            onClick={() => setView('form')}
          >
            ＋ Report Issue
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="app-main">
        {view === 'list' && (
          <TicketList
            onViewTicket={openDetail}
            onCreateNew={() => setView('form')}
          />
        )}
        {view === 'form' && (
          <TicketForm
            onSuccess={() => setView('list')}
            onCancel={() => setView('list')}
          />
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selectedTicketId && (
        <TicketDetail
          ticketId={selectedTicketId}
          onClose={closeDetail}
          onUpdated={closeDetail}
        />
      )}
    </div>
  )
}

export default App;
