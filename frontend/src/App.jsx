import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Box, LayoutDashboard, Activity, CheckCircle, Clock, X, Plus, ShieldAlert } from 'lucide-react';
import FloatingLines from './FloatingLines';
import RotatingText from './RotatingText';
import './App.css';

function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/resources');
      setResources(response.data.map(res => ({ ...res, status: res.status || 'ACTIVE' })));
    } catch (error) { console.error("Database connection failed."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/resources', { ...formData, status: 'ACTIVE' });
      setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });
      fetchResources();
      setIsDrawerOpen(false);
    } catch (error) { console.error("Failed to save."); }
  };

  const filtered = resources.filter(res => 
    (res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'ALL' || res.type === filterType)
  );

  const totalCapacity = resources.reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0);

  return (
    <div className="app-wrapper">
      
      {/* 🚀 THE NEW FLOATING LINES BACKGROUND */}
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
        {/* Sidebar Navigation */}
        <aside className="premium-sidebar">
          <div className="brand">
            <div className="brand-logo"><Box size={22} className="icon-white" /></div>
            <span>CampusHub</span>
          </div>
          <nav className="nav-menu">
            <button className="nav-btn active"><LayoutDashboard size={18} /> Registry</button>
            <button className="nav-btn"><Activity size={18} /> Telemetry</button>
            <button className="nav-btn"><ShieldAlert size={18} /> Security</button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="premium-main">
          <header className="page-header">
            <div>
              {/* 🚀 THE NEW ROTATING TEXT HEADER */}
              <h1 className="main-title">
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
              <p className="subtitle">Maintain and provision campus assets across all sectors.</p>
            </div>
            <button className="primary-action-btn" onClick={() => setIsDrawerOpen(true)}>
              <Plus size={18} /> Provision Asset
            </button>
          </header>

          {/* Bento Box Metrics View */}
          <div className="bento-grid">
            <div className="bento-card stat-card">
              <span className="stat-title">Network Nodes</span>
              <span className="stat-value">{resources.length}</span>
            </div>
            <div className="bento-card stat-card">
              <span className="stat-title">Total Capacity Limit</span>
              <span className="stat-value">{totalCapacity} <span className="stat-sub">users</span></span>
            </div>
            <div className="bento-card health-card">
              <div className="health-header">
                <span className="stat-title">System Health</span>
                <div className="live-pulse"></div>
              </div>
              <span className="health-status">100% Operational</span>
            </div>
          </div>

          {/* Data Controls (Module A Requirements) */}
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
          </div>

          {/* Resource Grid View */}
          <div className="resource-grid">
            <AnimatePresence>
              {filtered.map((res) => (
                <motion.div key={res.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="premium-card">
                  <div className="card-top">
                    <div className="card-badge">{res.type.replace('_', ' ')}</div>
                    <div className={`status-pill ${res.status.toLowerCase()}`}>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Slide-Out Drawer for Provisioning */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} />
              <motion.div className="provision-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                <div className="drawer-header">
                  <h2>Initialize Node</h2>
                  <button className="close-btn" onClick={() => setIsDrawerOpen(false)}><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="drawer-form">
                  <div className="input-group">
                    <label>Resource Identity</label>
                    <input type="text" placeholder="e.g. Auditorium Alpha" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  
                  <div className="input-row">
                    <div className="input-group">
                      <label>Classification</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LAB">Research Lab</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="EQUIPMENT">Equipment</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Capacity limit</label>
                      <input type="number" placeholder="00" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>Sector Mapping</label>
                    <input type="text" placeholder="e.g. Block C, Floor 2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                  </div>
                  
                  <div className="input-group">
                    <label>Active Window</label>
                    <input type="text" value={formData.availabilityWindows} onChange={e => setFormData({...formData, availabilityWindows: e.target.value})} required />
                  </div>
                  
                  <button type="submit" className="submit-action-btn">Commit to Registry</button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;