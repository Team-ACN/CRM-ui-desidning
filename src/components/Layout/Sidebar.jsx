import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, User, Building2, FileText, LayoutDashboard, ChevronDown, IndianRupee } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-10 h-10 bg-emerald-800 rounded-lg flex items-center justify-center text-white font-bold">
            ACN
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 truncate">ACN</h3>
            <p className="text-xs text-gray-500 truncate">Samarth Jangir</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <NavItem to="/home" icon={<Home size={20} />} label="Home" />
        <NavItem to="/agents" icon={<Users size={20} />} label="Agents" />
        <NavItem to="/leads" icon={<User size={20} />} label="Leads" />
        <NavItem to="/properties" icon={<Building2 size={20} />} label="Properties" />
        <NavItem to="/requirements" icon={<FileText size={20} />} label="Requirements" />
        <NavItem to="/qc-dashboard" icon={<LayoutDashboard size={20} />} label="QC Dashboard" />
        <NavItem to="/finance" icon={<IndianRupee size={20} />} label="Finance" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
        isActive 
          ? 'bg-gray-100 text-gray-900' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-gray-900' : 'text-gray-500'}>
            {icon}
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
