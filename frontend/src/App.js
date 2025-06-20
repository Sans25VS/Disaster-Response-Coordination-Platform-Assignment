import React, { useState, useEffect } from 'react';
import DarkModeToggle from './components/DarkModeToggle';
import DisasterManagement from './components/DisasterManagement';
import ReportManagement from './components/ReportManagement';
import ResourceManagement from './components/ResourceManagement';
import SocialMediaFeed from './components/SocialMediaFeed';
import Map from './components/Map';
import './styles/App.css';
import './styles/Tabs.css';

const Tab = ({ label, isActive, onClick }) => (
  <button
    className={`tab-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
);

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`main-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <header className="app-header">
        <h1>Disaster Response Platform</h1>
        <nav className="tab-nav">
          <Tab label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <Tab label="Disasters" isActive={activeTab === 'disasters'} onClick={() => setActiveTab('disasters')} />
          <Tab label="Resources" isActive={activeTab === 'resources'} onClick={() => setActiveTab('resources')} />
          <Tab label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>
      </header>
      
      <main className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <SocialMediaFeed />
            <Map />
          </div>
        )}
        {activeTab === 'disasters' && <DisasterManagement />}
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'reports' && <ReportManagement />}
      </main>
      
    </div>
  );
}

export default App; 