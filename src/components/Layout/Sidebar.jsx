import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, User, Building2, FileText, MessageSquare, LayoutDashboard, ChevronDown, IndianRupee, Layers, Upload, Zap, Scale } from 'lucide-react';

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
        <NavItem to="/legal-doc/home" icon={<Home size={20} />} label="Home" />
        <NavItem to="/home" icon={<Home size={20} />} label="Home - Samarth" />
        <NavItem to="/agents" icon={<Users size={20} />} label="Agents" />
        <NavItem to="/leads" icon={<User size={20} />} label="Leads" />
        <NavItem to="/properties" icon={<Building2 size={20} />} label="Properties" />
        <NavItem to="/bulk-upload" icon={<Upload size={20} />} label="Bulk Upload" />
        <NavItem to="/requirements" icon={<FileText size={20} />} label="Requirements" />
        <NavItem to="/enquiries" icon={<MessageSquare size={20} />} label="Enquiries" />
        <NavItem to="/qc-dashboard" icon={<LayoutDashboard size={20} />} label="QC Dashboard" />
        <NavItem to="/finance" icon={<IndianRupee size={20} />} label="Finance" />
        <NavItem to="/cms" icon={<Layers size={20} />} label="CMS" />
        <NavItem to="/edge" icon={<Zap size={20} />} label="Edge" />
        <LegalDocNavGroup />
      </nav>
    </div>
  );
};

const LEGAL_DOC_SUB_ITEMS = [
  { to: '/legal-doc/lead', label: 'Leads' },
  { to: '/legal-doc/qualify', label: 'Qualify' },
  { to: '/legal-doc/service', label: 'Service' },
];

const LegalDocNavGroup = () => {
  const location = useLocation();
  const isInGroup = LEGAL_DOC_SUB_ITEMS.some((item) => location.pathname.startsWith(item.to));
  const [open, setOpen] = useState(isInGroup);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          isInGroup ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className={isInGroup ? 'text-gray-900' : 'text-gray-500'}>
          <Scale size={20} />
        </span>
        Legal & Doc
        <ChevronDown
          size={16}
          className={`ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-1 ml-8 space-y-1">
          {LEGAL_DOC_SUB_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
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
