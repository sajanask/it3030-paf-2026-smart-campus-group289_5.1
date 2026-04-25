import { useState } from 'react'
import NotificationBell from './components/notifications/NotificationBell'
import { useNotifications } from './hooks/useNotifications'
import './App.css'

function App() {
  const [draftUserId, setDraftUserId] = useState(
    () => localStorage.getItem('smartcampusUserId') ?? '',
  )
  const [activeUserId, setActiveUserId] = useState(
    () => localStorage.getItem('smartcampusUserId') ?? '',
  )
  const [isBellOpen, setIsBellOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
  } = useNotifications(activeUserId)

  function connectInbox(event) {
    event.preventDefault()
    localStorage.setItem('smartcampusUserId', draftUserId)
    setActiveUserId(draftUserId)
    setIsBellOpen(false)
  }

  async function handleMarkAsRead(notificationId) {
    try {
      await markAsRead(notificationId)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Smart Campus</p>
          <h1>Notification Center</h1>
          <p className="hero-text">
            Track booking approvals, booking conflicts, and incoming requests from one
            bell in the header.
          </p>
        </div>

        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          error={error}
          isOpen={isBellOpen}
          onToggle={() => setIsBellOpen((open) => !open)}
          onRefresh={refreshNotifications}
          onMarkAsRead={handleMarkAsRead}
        />
      </header>

      <main className="dashboard-grid">
        <section className="panel">
          <p className="eyebrow">Connect</p>
          <h2>Choose a user inbox</h2>
          <p className="panel-text">
            Paste the Mongo user id you want to monitor, then the bell will show the unread
            count and latest notifications for that user.
          </p>

          <form className="user-form" onSubmit={connectInbox}>
            <label className="field">
              <span>User ID</span>
              <input
                value={draftUserId}
                onChange={(event) => setDraftUserId(event.target.value)}
                placeholder="Enter a Mongo user id"
              />
            </label>

            <button type="submit" className="primary-button">
              Load notifications
            </button>
          </form>
        </section>

        <section className="panel accent-panel">
          <p className="eyebrow">Live Status</p>
          <h2>Bell summary</h2>
          <div className="stats">
            <div className="stat-card">
              <span>Active user</span>
              <strong>{activeUserId || 'Not connected'}</strong>
            </div>
            <div className="stat-card">
              <span>Unread count</span>
              <strong>{unreadCount}</strong>
            </div>
            <div className="stat-card">
              <span>Total notifications</span>
              <strong>{notifications.length}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
