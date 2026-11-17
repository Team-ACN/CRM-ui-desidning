import React from 'react';
import PropertyCardMock from './PropertyCardMock';

/** CMS "Inventory discovery" component: heading, "See All" and a rail of property cards. */
const InventoryDiscoveryMock = ({ heading = 'Featured Properties', count = 5, kind = 'resale' }) => (
  <div style={{ paddingTop: 32 }}>
    <div className="flex items-center justify-between" style={{ padding: '0 16px 16px' }}>
      <h3 className="truncate" style={{ fontSize: 20, fontWeight: 600, color: '#404040' }}>{heading}</h3>
      <span style={{ fontSize: 16, color: '#0F766E' }}>See All</span>
    </div>
    <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 12, padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardMock key={i} index={i} kind={kind} width={272} />
      ))}
    </div>
  </div>
);

export default InventoryDiscoveryMock;
