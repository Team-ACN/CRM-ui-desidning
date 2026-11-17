import React from 'react';
import { Search, Phone, ChevronRight } from 'lucide-react';
import PropertyCardMock from './PropertyCardMock';
import edgeBandBg from '../../../../assets/appPreview/edge-widget-head-bg.svg';
import edgeLogo from '../../../../assets/appPreview/acn-edge-logo.svg';
import edgeNewspaper from '../../../../assets/appPreview/edge-widget-newspaper.png';
import serviceCloud from '../../../../assets/appPreview/service-widget-cloud.png';
import vaultLogo from '../../../../assets/appPreview/vault-logo.png';
import myBusinessImg from '../../../../assets/appPreview/myBusinessHomeImage.png';
import discoverImg from '../../../../assets/appPreview/searchprophomeImg.png';
import edgeHomeImg from '../../../../assets/appPreview/EdgeHomeImg.png';

import { DEFAULT_HEADINGS } from './constants';

const Rail = ({ children, gap = 12 }) => (
  <div className="flex overflow-x-auto no-scrollbar" style={{ gap, padding: '0 16px' }}>{children}</div>
);

const SectionHead = ({ heading, action = 'See All' }) => (
  <div className="flex items-center justify-between" style={{ padding: '0 16px 16px' }}>
    <h3 className="truncate" style={{ fontSize: 20, fontWeight: 600, color: '#404040' }}>{heading}</h3>
    {action && <span style={{ fontSize: 16, color: '#0F766E' }}>{action}</span>}
  </div>
);

const InventoryRail = ({ heading, kind }) => (
  <div style={{ paddingTop: 32 }}>
    <SectionHead heading={heading} />
    <Rail>
      {[0, 1, 2, 3].map((i) => (
        <PropertyCardMock key={i} index={i} kind={kind} width={272} />
      ))}
    </Rail>
  </div>
);

const Dots = ({ n = 4, active = 0, color = '#14B8A6' }) => (
  <div className="flex justify-center" style={{ gap: 6, paddingTop: 12 }}>
    {Array.from({ length: n }).map((_, i) => (
      <span key={i} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 3, background: i === active ? color : '#D4D4D4' }} />
    ))}
  </div>
);

const EdgeCard = ({ w, label, img, bg }) => (
  <div className="shrink-0 relative overflow-hidden" style={{ width: w, height: 150, borderRadius: 16, background: bg || '#FAFAFA', border: '1px solid #E5E5E5' }}>
    <span style={{ position: 'absolute', left: 14, top: 14, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: '#404040' }}>{label}</span>
    <img src={img} alt="" style={{ position: 'absolute', right: 0, bottom: 0, height: '70%', objectFit: 'contain' }} />
  </div>
);
function PropertyEdgeCards() {

  return (
    <div style={{ paddingTop: 24 }}>
      <Rail>
        <EdgeCard w={160} label="MY BUSINESS" img={myBusinessImg} />
        <EdgeCard w={248} label="DISCOVER PROPERTIES" img={discoverImg} />
        <EdgeCard w={248} label="EDGE" img={edgeHomeImg} />
      </Rail>
    </div>
  );
}

function DelistInventories({ heading }) {
  return (
    <div style={{ marginTop: 32, background: '#881337', paddingBottom: 28 }}>
      <div style={{ overflow: 'hidden', background: '#FDE047', transform: 'rotate(-2deg) scale(1.06)', padding: '6px 0', margin: '10px 0 18px' }}>
        <p className="whitespace-nowrap" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#881337' }}>
          {Array.from({ length: 5 }).map(() => `${(heading || 'Attention Needed').toUpperCase()}  ✦  `).join('')}
        </p>
      </div>
      <Rail>
        {[0, 1, 2].map((i) => (
          <PropertyCardMock key={i} index={i} width={300} />
        ))}
      </Rail>
      <Dots n={3} />
      <p className="text-center text-white" style={{ fontSize: 14, fontWeight: 600, paddingTop: 12 }}>See All</p>
    </div>
  );
}

function EnquiryReceived({ heading }) {
  return (
    <div style={{ paddingTop: 32 }}>
      <div className="flex items-center justify-center gap-2" style={{ paddingBottom: 12 }}>
        <Phone size={16} color="#0F766E" />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#404040' }}>{heading || 'Enquiry Received'} (4)</h3>
        <Phone size={16} color="#0F766E" />
      </div>
      <Rail>
        {[0, 1, 2].map((i) => (
          <PropertyCardMock key={i} index={i} enquiry width={290} />
        ))}
      </Rail>
      <div className="flex justify-center" style={{ paddingTop: 14 }}>
        <span style={{ padding: '8px 22px', borderRadius: 10, border: '1px solid #0F766E', color: '#0F766E', fontSize: 14, fontWeight: 600 }}>See All</span>
      </div>
    </div>
  );
}

function EnquiryFeedback({ heading }) {
  return (
    <div style={{ paddingTop: 32 }}>
      <SectionHead heading={`${heading || 'Made Enquiries? Review Them'} (3)`} action={null} />
      <Rail>
        {[3, 4, 1].map((i) => (
          <PropertyCardMock key={i} index={i} enquiry width={290} />
        ))}
      </Rail>
    </div>
  );
}

function EdgeWidget({ heading }) {
  const cards = ['Whitefield micro-market', 'Sarjapur price trend', 'Devanahalli launches'];
  return (
    <div style={{ marginTop: 32, background: '#FCE0E0', paddingBottom: 24 }}>
      <div className="relative flex items-center" style={{ height: 102, padding: '0 16px', backgroundImage: `url(${edgeBandBg})`, backgroundSize: 'cover' }}>
        <div className="flex-1">
          <img src={edgeLogo} alt="" style={{ width: 120, height: 19 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginTop: 6 }}>{heading || 'Early Market insights'}</p>
        </div>
        <img src={edgeNewspaper} alt="" style={{ height: 80 }} />
      </div>
      <div style={{ paddingTop: 16 }}>
        <Rail>
          {cards.map((c) => (
            <div key={c} className="shrink-0 flex items-end" style={{ width: 240, height: 340, borderRadius: 16, border: '1px solid #FDDCE7', background: 'linear-gradient(180deg,#FFF1F2,#FECDD3)', padding: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#881337' }}>{c}</p>
            </div>
          ))}
        </Rail>
      </div>
    </div>
  );
}

const TILES = ['#EADBDE', '#DCE9BB', '#E8F3C9', '#CCD1F1', '#EFE9C5', '#F1E8C9'];
const SERVICE_NAMES = ['Khata Transfer', 'E-Khata', 'Encumbrance Cert.', 'Registry', 'MOU', 'Due Diligence'];

function ServiceWidget({ heading }) {
  return (
    <div className="relative overflow-hidden" style={{ marginTop: 32, height: 342, background: 'linear-gradient(180deg,#15B0E6,#A2DEFA)' }}>
      <img src={serviceCloud} alt="" style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0.54 }} />
      <div className="relative" style={{ padding: '24px 16px 0' }}>
        <p style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{heading || 'Legal & Documentation'}</p>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: '#fff', opacity: 0.9 }}>SERVICES</p>
        <p className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#fff', marginTop: 4 }}>
          Powered by <img src={vaultLogo} alt="" style={{ height: 14 }} />
        </p>
      </div>
      <div className="relative flex overflow-x-auto no-scrollbar" style={{ gap: 12, padding: '20px 16px 0' }}>
        {SERVICE_NAMES.map((n, i) => (
          <div key={n} className="shrink-0 flex items-end" style={{ width: 140, height: 174, borderRadius: 14, background: TILES[i % TILES.length], padding: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{n}</p>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 18, background: '#F2F2F2', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
    </div>
  );
}

function SearchWidget() {
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div className="flex items-center gap-2" style={{ height: 60, borderRadius: 12, background: '#FAFAFA', border: '1px solid #D4D4D4', padding: '0 14px' }}>
        <Search size={18} color="#737373" />
        <span style={{ fontSize: 14, color: '#737373' }}>Search for the property here...</span>
      </div>
    </div>
  );
}

const Stub = () => (
  <div style={{ margin: '24px 16px 0', padding: 24, background: '#f0f4f8', border: '1px solid #d9e2ec', borderRadius: 8, textAlign: 'center', color: '#52606d', fontSize: 13 }}>
    🚧 UI Under Construction 🚧
  </div>
);

const EDGE_LABELS = { EDGE_HERO: 'Hero Section', EDGE_VISUAL_STORIES: 'Visual Stories', EDGE_PROJECT_UPDATES: 'Latest Project Updates', EDGE_LAST_48: 'Last 48 Hours', EDGE_LOCATION_SORT: 'Location wise sort' };

export function SystemWidgetMock({ type, heading }) {
  const h = heading || DEFAULT_HEADINGS[type] || '';
  switch (type) {
    case 'PROPERTY_EDGE_CARDS': return <PropertyEdgeCards />;
    case 'DELIST_INVENTORIES': return <DelistInventories heading={h} />;
    case 'ENQUIRY_RECEIVED': return <EnquiryReceived heading={h} />;
    case 'ENQUIRY_FEEDBACK': return <EnquiryFeedback heading={h} />;
    case 'RESALE_INVENTORY': return <InventoryRail heading={h} kind="resale" />;
    case 'RENTAL_INVENTORY': return <InventoryRail heading={h} kind="rental" />;
    case 'SUGGESTED_PROPERTIES': return <Stub />;
    case 'POPUP': return <Stub />;
    case 'SEARCH': return <SearchWidget />;
    case 'EDGE_WIDGET': return <EdgeWidget heading={h} />;
    case 'SERVICE_WIDGET': return <ServiceWidget heading={h} />;
    default:
      return (
        <div style={{ margin: '24px 16px 0', padding: 16, border: '1px dashed #D4D4D4', borderRadius: 8, fontSize: 12, color: '#737373', display: 'flex', alignItems: 'center', gap: 4 }}>
          {EDGE_LABELS[type] || type} <ChevronRight size={12} />
        </div>
      );
  }
}

export default SystemWidgetMock;
