import React from 'react';
import { LayoutDashboard, History, Settings, Eye } from 'lucide-react';
import NetworkHealthGauge from './NetworkHealthGauge';

const Sidebar = ({ performanceRatio }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Eye className="sidebar-logo" size={28} />
        </div>
        <h2 className="sidebar-title">ISP Eye</h2>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <History size={20} />
          <span>History</span>
        </a>
        <a href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <NetworkHealthGauge ratio={performanceRatio} />
      </div>
    </aside>
  );
};

export default Sidebar;
