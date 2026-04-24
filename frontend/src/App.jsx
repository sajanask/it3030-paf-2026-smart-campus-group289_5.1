import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Box, LayoutDashboard, Clock, X, Plus, Info, Map as MapIcon, Cpu } from 'lucide-react';
import FloatingLines from './FloatingLines';
import RotatingText from './RotatingText';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [connectionError, setConnectionError] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('identity');
  
  const [formData, setFormData] = useState({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '08:00 AM - 05:00 PM' });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resources`);
      setResources(response.data.map(res => ({ ...res, status: res.status || 'ACTIVE' })));
      setConnectionError('');
    } catch (error) {
      console.error('Database connection failed.', error);
      setConnectionError('Unable to load resources. Make sure the backend and MongoDB are running.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.capacity) {
      alert('Please ensure Asset Identity, Sector Mapping, and Capacity are filled out.');
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
            <button className="nav-btn active"><LayoutDashboard size={18} /> Asset Dashboard</button>
          </nav>
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
          </div>

          {connectionError && <p className="subtitle">{connectionError}</p>}

          {/* Resource Grid View */}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
