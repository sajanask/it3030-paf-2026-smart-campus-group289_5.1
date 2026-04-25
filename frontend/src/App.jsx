import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Box, LayoutDashboard, Clock, X, Plus, Info, Map as MapIcon, Cpu, Activity, TrendingUp, Battery, Wifi, Server, Calendar, AlertTriangle, CheckCircle, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock3, Zap } from 'lucide-react';
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
  const [selectedView, setSelectedView] = useState('dashboard');
  
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
          </header>

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
