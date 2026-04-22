import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Users, Database, Box, LayoutDashboard, Activity, Terminal, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';
import './App.css';

function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 5)]);
  };

  useEffect(() => { 
    fetchResources(); 
    addLog("System Dashboard Synchronized.");
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/resources');
      setResources(response.data.map(res => ({ ...res, status: res.status || 'ACTIVE' })));
    } catch (error) { addLog("Error: Connection to central database failed.", "err"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/resources', { ...formData, status: 'ACTIVE' });
      addLog(`Success: Resource "${formData.name}" added to registry.`);
      setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });
      fetchResources();
    } catch (error) { addLog("Error: Failed to save record.", "err"); }
  };

  const filtered = resources.filter(res => 
    (res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'ALL' || res.type === filterType)
  );

  return (
    <div className="app-container">
      {/* Professional Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <LayoutDashboard size={24} className="brand-icon" />
          <span>CampusHub</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><Box size={18} /> Resources</div>
          <div className="nav-item"><Activity size={18} /> Analytics</div>
          <div className="nav-item"><Users size={18} /> Permissions</div>
        </nav>
        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="dot"></div> System Operational
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-text">
            <h1>Resource Management</h1>
            <p>Maintain and provision campus assets across all sectors.</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-label">Total Assets</span>
              <span className="stat-value">{resources.length}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Add Resource Panel */}
          <section className="content-card form-card">
            <div className="card-header">
              <h3><Plus size={18} /> Register New Asset</h3>
            </div>
            <form onSubmit={handleSubmit} className="professional-form">
              <div className="form-group">
                <label>Resource Name</label>
                <input type="text" placeholder="e.g. Main Auditorium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Research Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" placeholder="0" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Location / Sector</label>
                <input type="text" placeholder="e.g. Block C, Floor 2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Availability Hours</label>
                <input type="text" value={formData.availabilityWindows} onChange={e => setFormData({...formData, availabilityWindows: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary">Register Resource</button>
            </form>
          </section>

          {/* Registry List */}
          <section className="list-container">
            <div className="search-wrapper">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search by name or sector..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="type-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Halls</option>
                <option value="LAB">Labs</option>
              </select>
            </div>

            <div className="resource-list">
              <AnimatePresence>
                {filtered.map((res) => (
                  <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="resource-row">
                    <div className="row-main">
                      <div className="row-icon"><Database size={16} /></div>
                      <div className="row-info">
                        <h4>{res.name}</h4>
                        <p>{res.location} • {res.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="row-meta">
                      <div className="meta-pill"><Users size={12} /> {res.capacity}</div>
                      <div className="meta-pill"><Clock size={12} /> {res.availabilityWindows}</div>
                      <div className={`status-badge ${res.status.toLowerCase()}`}>
                        <CheckCircle size={12} /> {res.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;