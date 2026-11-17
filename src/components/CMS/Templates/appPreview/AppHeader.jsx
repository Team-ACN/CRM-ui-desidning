import React from 'react';
import { Search, Headphones, Bell, User } from 'lucide-react';
import home from '../../../../assets/appPreview/navbar/home.png';
import homeSelected from '../../../../assets/appPreview/navbar/homeSelected.png';
import properties from '../../../../assets/appPreview/navbar/properties.png';
import services from '../../../../assets/appPreview/navbar/services.png';
import edge from '../../../../assets/appPreview/navbar/edge.png';
import mybusiness from '../../../../assets/appPreview/navbar/mybusiness.png';

const TABS = [
  { key: 'home', label: 'Home', icon: home, selectedIcon: homeSelected, color: '#EA580C', glow: '#FB923C' },
  { key: 'properties', label: 'Properties', icon: properties, color: '#0F766E', glow: '#14B8A6' },
  { key: 'services', label: 'Services', icon: services, color: '#1E40AF', glow: '#60A5FA' },
  { key: 'edge', label: 'Edge', icon: edge, color: '#9F1239', glow: '#FB7185' },
  { key: 'mybusiness', label: 'My Business', icon: mybusiness, color: '#3730A3', glow: '#818CF8' },
];

/**
 * App header: 70px top bar, 90px tab strip, 60px search bar (not on Services).
 * `tint` recolours the selected tab (e.g. from the Top Banner colour).
 * `scrolled` collapses the top bar + tab labels' height into a compact sticky bar.
 */
const AppHeader = ({ page = 'home', scrolled = false, tint }) => {
  const showSearch = page !== 'services';
  return (
    <div className="relative" style={{ zIndex: 5, background: scrolled ? '#FAFAFA' : 'transparent', boxShadow: scrolled ? '0 1px 0 #E5E5E5' : 'none' }}>
      <div className="flex items-center justify-between" style={{ height: 70, padding: '0 16px' }}>
        <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
          <User size={18} color="#404040" />
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" style={{ height: 40, padding: '0 14px', borderRadius: 25, background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: '#FACC15' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F766E' }}>120</span>
          </span>
          <Headphones size={22} color="#262626" />
          <Bell size={22} color="#262626" />
        </div>
      </div>

      {!scrolled && (
        <div className="flex overflow-hidden" style={{ height: 90, gap: 12, padding: '0 16px', alignItems: 'center' }}>
          {TABS.map((t) => {
            const sel = t.key === page;
            const fill = sel ? (t.key === 'home' && tint ? tint : t.color) : '#FAFAFA';
            return (
              <div
                key={t.key}
                className="shrink-0 flex flex-col items-center justify-center"
                style={{
                  width: 80,
                  height: 76,
                  borderRadius: 8,
                  background: fill,
                  border: sel ? 'none' : '1px solid #D4D4D4',
                  boxShadow: sel ? `0 4px 14px ${t.glow}66` : 'none',
                  gap: 2,
                }}
              >
                <img src={sel && t.selectedIcon ? t.selectedIcon : t.icon} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: sel ? '#fff' : '#404040' }}>{t.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {showSearch && (
        <div style={{ padding: scrolled ? '0 16px 8px' : '16px 16px 0' }}>
          <div className="flex items-center gap-2" style={{ height: 60, borderRadius: 12, background: '#FAFAFA', border: '1px solid #D4D4D4', padding: '0 14px' }}>
            <Search size={18} color="#737373" />
            <span style={{ fontSize: 14, color: '#737373' }}>Search for the property here...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppHeader;
