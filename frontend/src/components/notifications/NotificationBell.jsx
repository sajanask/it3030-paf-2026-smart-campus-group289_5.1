function NotificationBell({
  notifications,
  unreadCount,
  isLoading,
  error,
  isOpen,
  onToggle,
  onRefresh,
  onMarkAsRead,
}) {
  return (
    <div className="notification-shell">
      <button
        type="button"
        className="notification-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Open notifications"
      >
        <span className="notification-icon" aria-hidden="true">
          🔔
        </span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2>Notifications</h2>
            </div>
            <button type="button" className="ghost-button" onClick={onRefresh}>
              Refresh
            </button>
          </div>

          {isLoading && <p className="notification-state">Loading notifications...</p>}
          {!isLoading && error && <p className="notification-state error">{error}</p>}
          {!isLoading && !error && notifications.length === 0 && (
            <p className="notification-state">No notifications yet.</p>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <div
                    className={`notification-item ${notification.read ? 'is-read' : 'is-unread'}`}
                    onClick={() => onMarkAsRead(notification.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="notification-copy">
                      <p>{notification.message}</p>
                      <span>{notification.read ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
