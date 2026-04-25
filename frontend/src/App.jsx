import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Box, LayoutDashboard, Clock, X, Plus, Info, Map as MapIcon, Cpu, Activity, TrendingUp, Battery, Wifi, Server, Calendar, AlertTriangle, CheckCircle, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock3, Zap, Bell, Trash2, Check, AlertOctagon, Info as InfoIcon, XCircle, Timer, Save, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import FloatingLines from './FloatingLines';
import RotatingText from './RotatingText';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  REMINDER: 'reminder',
  SCHEDULED: 'scheduled'
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create notification
const createNotification = (type, title, message) => ({
  id: generateId(),
  type,
  title,
  message,
  timestamp: new Date(),
  read: false,
  pinned: false,
  scheduledTime: null
});

// Local Storage Keys
const STORAGE_KEYS = {
  NOTIFICATIONS: 'campus_notifications',
  REMINDERS: 'campus_reminders',
  SETTINGS: 'campus_notification_settings'
};

// Load from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error:', e);
  }
};

function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [connectionError, setConnectionError] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('identity');
  const [selectedView, setSelectedView] = useState('dashboard');
  
  // Notification state - Load from localStorage
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPanel, setNotificationPanel] = useState(false);
  
  // Reminders state
  const [reminders, setReminders] = useState(() => loadFromStorage(STORAGE_KEYS.REMINDERS, []));
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ title: '', message: '', interval: 30 });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(() => 
    loadFromStorage(STORAGE_KEYS.SETTINGS, { 
      soundEnabled: true, 
      autoDismiss: true, 
      dismissDuration: 5000 
    })
  );
  
  const [formData, setFormData] = useState({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // Save reminders to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
  }, [reminders]);

  // Save settings to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, notificationSettings);
  }, [notificationSettings]);

  // Add notification function
  const addNotification = useCallback((type, title, message) => {
    const newNotification = createNotification(type, title, message);
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50);
      return updated;
    });
    
    // Play sound if enabled
    if (notificationSettings.soundEnabled) {
      playNotificationSound(type);
    }
  }, [notificationSettings.soundEnabled]);

  // Play notification sound
  const playNotificationSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different tones for different types
      const frequencies = {
        success: 800,
        error: 300,
        warning: 500,
        info: 600,
        reminder: 700
      };
      
      oscillator.frequency.value = frequencies[type] || 600;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Pin notification
  const pinNotification = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Undo clear - restore last cleared
  const [lastClearedNotifications, setLastClearedNotifications] = useState([]);
  const undoClear = () => {
    if (lastClearedNotifications.length > 0) {
      setNotifications(prev => [...lastClearedNotifications, ...prev]);
      setLastClearedNotifications([]);
      addNotification(NOTIFICATION_TYPES.SUCCESS, 'Notifications Restored', 'Previously cleared notifications have been restored');
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get pinned count
  const pinnedCount = notifications.filter(n => n.pinned).length;

  // Reminder functions
  const addReminder = () => {
    if (!reminderForm.title || !reminderForm.message) {
      addNotification(NOTIFICATION_TYPES.WARNING, 'Validation Error', 'Please fill in reminder title and message');
      return;
    }
    
    const newReminder = {
      id: generateId(),
      ...reminderForm,
      enabled: true,
      createdAt: new Date(),
      lastTriggered: null
    };
    
    setReminders(prev => [...prev, newReminder]);
    setReminderForm({ title: '', message: '', interval: 30 });
    setShowReminderModal(false);
    addNotification(NOTIFICATION_TYPES.SUCCESS, 'Reminder Set', `"${reminderForm.title}" has been scheduled`);
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Check reminders periodically
  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        
        const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : new Date(reminder.createdAt);
        const timeDiff = (now - lastTriggered) / 60000; // minutes
        
        if (timeDiff >= reminder.interval) {
          addNotification(NOTIFICATION_TYPES.REMINDER, reminder.title, reminder.message);
          setReminders(prev => prev.map(r => 
            r.id === reminder.id ? { ...r, lastTriggered: now } : r
          ));
        }
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(checkReminders);
  }, [reminders, addNotification]);

  // Quick reminder buttons
  const setQuickReminder = (minutes, title) => {
    const reminder = {
      id: generateId(),
      title: title,
      message: `Quick ${minutes} minute reminder`,
      interval: minutes,
      enabled: true,
      createdAt: new Date(),
      lastTriggered: null
    };
    setReminders(prev => [...prev, reminder]);
    addNotification(NOTIFICATION_TYPES.SUCCESS, 'Quick Reminder Set', `${minutes} minute reminder for "${title}" has been added`);
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case NOTIFICATION_TYPES.SUCCESS: return <CheckCircle size={18} />;
      case NOTIFICATION_TYPES.ERROR: return <XCircle size={18} />;
      case NOTIFICATION_TYPES.WARNING: return <AlertTriangle size={18} />;
      case NOTIFICATION_TYPES.INFO: return <InfoIcon size={18} />;
      default: return <Bell size={18} />;
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch(type) {
      case NOTIFICATION_TYPES.SUCCESS: return '#10b981';
      case NOTIFICATION_TYPES.ERROR: return '#ef4444';
      case NOTIFICATION_TYPES.WARNING: return '#f59e0b';
      case NOTIFICATION_TYPES.INFO: return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  useEffect(() => { fetchResources(); }, []);

  // Generate system notifications based on resources
  useEffect(() => {
    if (resources.length > 0) {
      // Check for low capacity resources
      const lowCapacity = resources.filter(r => r.capacity && r.capacity < 30);
      if (lowCapacity.length > 0) {
        addNotification(NOTIFICATION_TYPES.WARNING, 'Low Capacity Alert', `${lowCapacity.length} resource(s) have capacity below 30 users`);
      }
      
      // Check for out of service resources
      const outOfService = resources.filter(r => r.status === 'OUT_OF_SERVICE');
      if (outOfService.length > 0) {
        addNotification(NOTIFICATION_TYPES.ERROR, 'Service Outage', `${outOfService.length} resource(s) are currently out of service`);
      }
    }
  }, [resources.length]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resources`);
      const newResources = response.data.map(res => ({ ...res, status: res.status || 'ACTIVE' }));
      setResources(newResources);
      setConnectionError('');
      
      // Add success notification on data fetch
      if (newResources.length > 0) {
        addNotification(NOTIFICATION_TYPES.SUCCESS, 'Data Synced', `Successfully loaded ${newResources.length} resources from database`);
      }
    } catch (error) {
      console.error('Database connection failed.', error);
      setConnectionError('Unable to load resources. Make sure the backend and MongoDB are running.');
      addNotification(NOTIFICATION_TYPES.ERROR, 'Connection Failed', 'Unable to connect to database. Please check backend and MongoDB.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.capacity) {
      addNotification(NOTIFICATION_TYPES.WARNING, 'Validation Error', 'Please fill in all required fields: Asset Identity, Sector Mapping, and Capacity');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/resources`, {
        ...formData,
        capacity: Number(formData.capacity),
        status: 'ACTIVE'
      });
      setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });
      setConnectionError('');
      fetchResources();
      setIsDrawerOpen(false);
      setDrawerTab('identity');
      addNotification(NOTIFICATION_TYPES.SUCCESS, 'Resource Created', `Successfully provisioned "${formData.name}" to the registry`);
    } catch (error) {
      console.error('Failed to save.', error);
      setConnectionError('Unable to save the resource. Check the backend API and MongoDB connection.');
      addNotification(NOTIFICATION_TYPES.ERROR, 'Save Failed', 'Unable to save the resource. Please try again.');
    }
  };
      setIsDrawerOpen(false);
      setDrawerTab('identity'); 
    } catch (error) {
      console.error('Failed to save.', error);
      setConnectionError('Unable to save the resource. Check the backend API and MongoDB connection.');
    }
  };

  const filtered = resources.filter(res => 
    ((res.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (res.location || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'ALL' || res.type === filterType)
  );

  const totalCapacity = resources.reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0);
  
  // Analytics calculations
  const typeBreakdown = resources.reduce((acc, res) => {
    acc[res.type] = (acc[res.type] || 0) + 1;
    return acc;
  }, {});
  
  const statusBreakdown = resources.reduce((acc, res) => {
    acc[res.status] = (acc[res.status] || 0) + 1;
    return acc;
  }, {});
  
  const locationBreakdown = resources.reduce((acc, res) => {
    const loc = res.location?.split(',')[0] || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  
  const avgCapacity = resources.length > 0 ? Math.round(totalCapacity / resources.length) : 0;
  const activeResources = resources.filter(r => r.status === 'ACTIVE').length;
  const inactiveResources = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'LECTURE_HALL': return <Users size={16} />;
      case 'LAB': return <Server size={16} />;
      case 'MEETING_ROOM': return <MapPin size={16} />;
      case 'EQUIPMENT': return <Cpu size={16} />;
      default: return <Box size={16} />;
    }
  };

  return (
    <div className="app-wrapper">
      
      {/* 🚀 THE DIMMED FLOATING LINES BACKGROUND */}
      <div className="ambient-background">
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      <div className="premium-app">
        {/* Professional Clean Sidebar */}
        <aside className="premium-sidebar">
          <div className="brand">
            <div className="brand-logo"><Box size={22} className="icon-white" /></div>
            <span>CampusHub</span>
          </div>
          <nav className="nav-menu">
            <button className={`nav-btn ${selectedView === 'dashboard' ? 'active' : ''}`} onClick={() => setSelectedView('dashboard')}><LayoutDashboard size={18} /> Asset Dashboard</button>
            <button className={`nav-btn ${selectedView === 'analytics' ? 'active' : ''}`} onClick={() => setSelectedView('analytics')}><BarChart3 size={18} /> Analytics</button>
            <button className={`nav-btn ${selectedView === 'resources' ? 'active' : ''}`} onClick={() => setSelectedView('resources')}><Server size={18} /> Resources</button>
          </nav>
          
          {/* Sidebar Stats */}
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              <span className="sidebar-stat-label">Total Assets</span>
              <span className="sidebar-stat-value">{resources.length}</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-label">Active</span>
              <span className="sidebar-stat-value active-count">{activeResources}</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-label">Capacity</span>
              <span className="sidebar-stat-value">{totalCapacity}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="premium-main">
          <header className="page-header">
            <div>
              {/* RESTORED: Rotating Text Header */}
              <h1 className="main-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                Resource 
                <RotatingText
                  texts={['Management', 'Intelligence', 'Provisioning', 'Operations']}
                  mainClassName="rotating-badge"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                />
              </h1>
              <p className="subtitle">Maintain and provision campus assets across all sectors. Last updated: {new Date().toLocaleString()}</p>
            </div>
            <button className="primary-action-btn" onClick={() => setIsDrawerOpen(true)}>
              <Plus size={18} /> Provision Asset
            </button>
            
            {/* Notification Bell Button */}
            <button className="notification-bell-btn" onClick={() => setNotificationPanel(!notificationPanel)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          </header>

          {/* Notification Panel */}
          <AnimatePresence>
            {notificationPanel && (
              <motion.div className="notification-panel" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}>
                <div className="notification-panel-header">
                  <h3><Bell size={18} /> Notifications</h3>
                  <div className="notification-panel-actions">
                    <button onClick={markAllAsRead} title="Mark all as read"><Check size={16} /></button>
                    <button onClick={() => { setLastClearedNotifications(notifications); clearAllNotifications(); }} title="Clear all"><Trash2 size={16} /></button>
                    <button onClick={() => setNotificationPanel(false)}><X size={16} /></button>
                  </div>
                </div>
                
                {/* Notification Tabs */}
                <div className="notification-tabs">
                  <button className={`notification-tab ${selectedView === 'dashboard' ? 'active' : ''}`} onClick={() => setSelectedView('dashboard')}>
                    <Bell size={14} /> All ({notifications.length})
                  </button>
                  <button className={`notification-tab ${selectedView === 'analytics' ? 'active' : ''}`} onClick={() => setSelectedView('analytics')}>
                    <Timer size={14} /> Reminders ({reminders.length})
                  </button>
                  <button className={`notification-tab ${selectedView === 'resources' ? 'active' : ''}`} onClick={() => setSelectedView('resources')}>
                    <Settings size={14} /> Settings
                  </button>
                </div>
                
                {/* Quick Reminder Buttons */}
                <div className="quick-reminder-bar">
                  <span className="quick-reminder-label">Quick Reminder:</span>
                  <button onClick={() => setQuickReminder(5, 'Stand up')}>5m Stand</button>
                  <button onClick={() => setQuickReminder(15, 'Break')}>15m Break</button>
                  <button onClick={() => setQuickReminder(30, 'Hydrate')}>30m Hydrate</button>
                  <button onClick={() => setQuickReminder(60, 'Lunch')}>60m Lunch</button>
                  <button className="add-reminder-btn" onClick={() => setShowReminderModal(true)}><Plus size={14} /></button>
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <Bell size={32} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <motion.div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.pinned ? 'pinned' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ borderLeftColor: getNotificationColor(notification.type) }}
                      >
                        <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.pinned && <span className="pin-indicator">📌</span>}
                            {notification.title}
                          </div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{formatTimestamp(notification.timestamp)}</div>
                        </div>
                        <div className="notification-actions">
                          <button onClick={() => pinNotification(notification.id)} title={notification.pinned ? "Unpin" : "Pin"}>
                            {notification.pinned ? "📌" : "📍"}
                          </button>
                          {!notification.read && <button onClick={() => markAsRead(notification.id)} title="Mark as read"><Check size={14} /></button>}
                          <button onClick={() => deleteNotification(notification.id)} title="Delete"><X size={14} /></button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                {/* Reminders Section */}
                {selectedView === 'analytics' && (
                  <div className="reminders-section">
                    <h4><Timer size={16} /> Active Reminders</h4>
                    {reminders.length === 0 ? (
                      <p className="no-reminders">No reminders set. Use quick buttons above or add custom reminders.</p>
                    ) : (
                      <div className="reminders-list">
                        {reminders.map(reminder => (
                          <div key={reminder.id} className={`reminder-item ${!reminder.enabled ? 'disabled' : ''}`}>
                            <div className="reminder-toggle">
                              <button onClick={() => toggleReminder(reminder.id)}>
                                {reminder.enabled ? '🔔' : '🔕'}
                              </button>
                            </div>
                            <div className="reminder-info">
                              <div className="reminder-title">{reminder.title}</div>
                              <div className="reminder-meta">Every {reminder.interval} min • {reminder.message}</div>
                            </div>
                            <button className="reminder-delete" onClick={() => deleteReminder(reminder.id)}><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Settings Section */}
                {selectedView === 'resources' && (
                  <div className="settings-section">
                    <h4><Settings size={16} /> Notification Settings</h4>
                    <div className="settings-list">
                      <div className="setting-item">
                        <div className="setting-info">
                          <span className="setting-label">Sound</span>
                          <span className="setting-desc">Play notification sounds</span>
                        </div>
                        <button 
                          className={`setting-toggle ${notificationSettings.soundEnabled ? 'on' : 'off'}`}
                          onClick={() => setNotificationSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                        >
                          {notificationSettings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                      </div>
                      <div className="setting-item">
                        <div className="setting-info">
                          <span className="setting-label">Auto-dismiss</span>
                          <span className="setting-desc">Automatically dismiss toasts</span>
                        </div>
                        <button 
                          className={`setting-toggle ${notificationSettings.autoDismiss ? 'on' : 'off'}`}
                          onClick={() => setNotificationSettings(prev => ({ ...prev, autoDismiss: !prev.autoDismiss }))}
                        >
                          {notificationSettings.autoDismiss ? '✅' : '❌'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Reminder Modal */}
          <AnimatePresence>
            {showReminderModal && (
              <>
                <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReminderModal(false)} />
                <motion.div className="reminder-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="modal-header">
                    <h3><Timer size={18} /> Set Custom Reminder</h3>
                    <button onClick={() => setShowReminderModal(false)}><X size={18} /></button>
                  </div>
                  <div className="modal-body">
                    <div className="input-group">
                      <label>Reminder Title</label>
                      <input type="text" placeholder="e.g. Meeting Reminder" value={reminderForm.title} onChange={e => setReminderForm(prev => ({ ...prev, title: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label>Message</label>
                      <input type="text" placeholder="e.g. Team standup in 5 minutes" value={reminderForm.message} onChange={e => setReminderForm(prev => ({ ...prev, message: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label>Interval (minutes)</label>
                      <input type="number" min="1" value={reminderForm.interval} onChange={e => setReminderForm(prev => ({ ...prev, interval: parseInt(e.target.value) || 30 }))} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="secondary-action-btn" onClick={() => setShowReminderModal(false)}>Cancel</button>
                    <button className="submit-action-btn" onClick={addReminder}>Set Reminder</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Toast Notifications Container */}
          <div className="toast-container">
            <AnimatePresence>
              {notifications.slice(0, 3).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={`toast toast-${notification.type}`}
                  initial={{ opacity: 0, x: 100, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: 'spring', damping: 25 }}
                  style={{ borderLeftColor: getNotificationColor(notification.type) }}
                >
                  <div className="toast-icon">{getNotificationIcon(notification.type)}</div>
                  <div className="toast-content">
                    <div className="toast-title">{notification.title}</div>
                    <div className="toast-message">{notification.message}</div>
                  </div>
                  <button className="toast-close" onClick={() => deleteNotification(notification.id)}><X size={14} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bento Box Metrics View - Enhanced with More Stats */}
          <div className="bento-grid">
            <div className="bento-card stat-card">
              <div className="stat-icon"><Box size={20} /></div>
              <span className="stat-title">Network Nodes</span>
              <span className="stat-value">{resources.length}</span>
              <span className="stat-subtitle">Total registered assets</span>
            </div>
            <div className="bento-card stat-card">
              <div className="stat-icon"><Users size={20} /></div>
              <span className="stat-title">Total Capacity</span>
              <span className="stat-value">{totalCapacity} <span className="stat-sub">users</span></span>
              <span className="stat-subtitle">Across all facilities</span>
            </div>
            <div className="bento-card health-card">
              <div className="health-header">
                <span className="stat-title">System Health</span>
                <div className="live-pulse"></div>
              </div>
              <span className="health-status">{resources.length > 0 ? Math.round((activeResources / resources.length) * 100) : 100}% Operational</span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: `${resources.length > 0 ? (activeResources / resources.length) * 100 : 100}%` }}></div>
              </div>
            </div>
            <div className="bento-card stat-card accent">
              <div className="stat-icon"><TrendingUp size={20} /></div>
              <span className="stat-title">Avg Utilization</span>
              <span className="stat-value">{avgCapacity}</span>
              <span className="stat-subtitle">Per resource average</span>
            </div>
            <div className="bento-card stat-card">
              <div className="stat-icon"><CheckCircle size={20} /></div>
              <span className="stat-title">Active</span>
              <span className="stat-value">{activeResources}</span>
              <span className="stat-subtitle">Currently operational</span>
            </div>
            <div className="bento-card stat-card warning">
              <div className="stat-icon"><AlertTriangle size={20} /></div>
              <span className="stat-title">Out of Service</span>
              <span className="stat-value">{inactiveResources}</span>
              <span className="stat-subtitle">Requires attention</span>
            </div>
          </div>

          {/* Analytics Section - Type & Status Breakdown */}
          {selectedView === 'analytics' && (
            <motion.div className="analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="section-title"><Activity size={20} /> Resource Analytics</h2>
              <div className="analytics-grid">
                {/* Type Distribution */}
                <div className="analytics-card">
                  <h3><PieChart size={18} /> Classification Distribution</h3>
                  <div className="distribution-list">
                    {Object.entries(typeBreakdown).map(([type, count]) => (
                      <div key={type} className="distribution-item">
                        <div className="dist-label">{type.replace('_', ' ')}</div>
                        <div className="dist-bar-container">
                          <div className="dist-bar" style={{ width: `${(count / resources.length) * 100}%` }}></div>
                        </div>
                        <div className="dist-value">{count} <span className="dist-percent">({Math.round((count / resources.length) * 100)}%)</span></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Status Distribution */}
                <div className="analytics-card">
                  <h3><Battery size={18} /> Status Overview</h3>
                  <div className="status-overview">
                    <div className="status-item">
                      <div className="status-indicator active"></div>
                      <span>Active</span>
                      <strong>{activeResources}</strong>
                    </div>
                    <div className="status-item">
                      <div className="status-indicator inactive"></div>
                      <span>Out of Service</span>
                      <strong>{inactiveResources}</strong>
                    </div>
                  </div>
                </div>
                
                {/* Location Distribution */}
                <div className="analytics-card">
                  <h3><MapPin size={18} /> Location Distribution</h3>
                  <div className="location-list">
                    {Object.entries(locationBreakdown).slice(0, 5).map(([loc, count]) => (
                      <div key={loc} className="location-item">
                        <span className="location-name">{loc}</span>
                        <span className="location-count">{count} assets</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Capacity Analysis */}
                <div className="analytics-card">
                  <h3><BarChart3 size={18} /> Capacity Analysis</h3>
                  <div className="capacity-stats">
                    <div className="capacity-item">
                      <span className="capacity-label">Total Capacity</span>
                      <span className="capacity-value">{totalCapacity}</span>
                    </div>
                    <div className="capacity-item">
                      <span className="capacity-label">Average per Resource</span>
                      <span className="capacity-value">{avgCapacity}</span>
                    </div>
                    <div className="capacity-item">
                      <span className="capacity-label">Largest Facility</span>
                      <span className="capacity-value">{Math.max(...resources.map(r => r.capacity || 0), 0)}</span>
                    </div>
                    <div className="capacity-item">
                      <span className="capacity-label">Smallest Facility</span>
                      <span className="capacity-value">{Math.min(...resources.map(r => r.capacity || 0), 0) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Controls (Search & Styled Dropdown Filter) */}
          <div className="data-controls">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search parameters or locations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="filter-box">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">All Classifications</option>
                <option value="LECTURE_HALL">Lecture Halls</option>
                <option value="LAB">Research Labs</option>
                <option value="MEETING_ROOM">Meeting Rooms</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <span className="view-count">Showing {filtered.length} of {resources.length} resources</span>
            </div>
          </div>

          {connectionError && <p className="subtitle">{connectionError}</p>}

          {/* Resource Grid View - Enhanced Cards */}
          <div className="resource-grid">
            <AnimatePresence>
              {filtered.map((res) => (
                <motion.div key={res.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="premium-card">
                  <div className="card-top">
                    <div className="card-badge">{(res.type || 'UNKNOWN').replace('_', ' ')}</div>
                    <div className={`status-pill ${(res.status || 'ACTIVE').toLowerCase()}`}>
                      <span className="dot"></span> {res.status}
                    </div>
                  </div>
                  <h3 className="card-title">{res.name}</h3>
                  <div className="card-metrics">
                    <div className="metric"><MapPin size={16} /> {res.location}</div>
                    <div className="metric"><Users size={16} /> Cap: {res.capacity}</div>
                  </div>
                  <div className="card-footer">
                    <Clock size={15} /> {res.availabilityWindows}
                  </div>
                  <div className="card-actions">
                    <button className="card-action-btn" title="View Details"><Info size={14} /></button>
                    <button className="card-action-btn" title="Edit"><Zap size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Box size={48} />
              <h3>No Resources Found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </main>

        {/* Split-Pane Drawer for Provisioning */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} />
              <motion.div className="provision-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                
                <div className="drawer-header">
                  <div>
                    <h2>Initialize Node</h2>
                    <p className="drawer-subtitle">Configure new campus asset parameters.</p>
                  </div>
                  <button className="close-btn" onClick={() => setIsDrawerOpen(false)}><X size={20} /></button>
                </div>
                
                <div className="drawer-split-layout">
                  {/* The Inner Sidebar */}
                  <aside className="drawer-inner-sidebar">
                    <button className={`inner-tab ${drawerTab === 'identity' ? 'active' : ''}`} onClick={() => setDrawerTab('identity')}>
                      <Info size={16} /> General Identity
                    </button>
                    <button className={`inner-tab ${drawerTab === 'location' ? 'active' : ''}`} onClick={() => setDrawerTab('location')}>
                      <MapIcon size={16} /> Sector Mapping
                    </button>
                    <button className={`inner-tab ${drawerTab === 'capacity' ? 'active' : ''}`} onClick={() => setDrawerTab('capacity')}>
                      <Cpu size={16} /> Configuration
                    </button>
                  </aside>

                  {/* The Form Content Area */}
                  <form className="drawer-form-content" id="provisionForm" onSubmit={handleSubmit}>
                    
                    <AnimatePresence mode="wait">
                      {drawerTab === 'identity' && (
                        <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="form-step">
                          <div className="input-group">
                            <label>Resource Identity</label>
                            <input type="text" placeholder="e.g. Auditorium Alpha" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div className="input-group">
                            <label>Classification</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                              <option value="LECTURE_HALL">Lecture Hall</option>
                              <option value="LAB">Research Lab</option>
                              <option value="MEETING_ROOM">Meeting Room</option>
                              <option value="EQUIPMENT">Equipment</option>
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {drawerTab === 'location' && (
                        <motion.div key="location" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="form-step">
                          <div className="input-group">
                            <label>Sector Mapping</label>
                            <input type="text" placeholder="e.g. Block C, Floor 2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                          </div>
                          <div className="input-group">
                            <label>Active Window</label>
                            <input type="text" placeholder="e.g. 08:00 AM - 05:00 PM" value={formData.availabilityWindows} onChange={e => setFormData({...formData, availabilityWindows: e.target.value})} />
                          </div>
                        </motion.div>
                      )}

                      {drawerTab === 'capacity' && (
                        <motion.div key="capacity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="form-step">
                          <div className="input-group">
                            <label>Capacity Limit (Users)</label>
                            <input type="number" placeholder="Enter maximum capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </form>
                </div>

                {/* Fixed Footer for Submission */}
                <div className="drawer-footer">
                  <button type="button" className="secondary-action-btn" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
                  <button type="submit" form="provisionForm" className="submit-action-btn">Commit to Registry</button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
