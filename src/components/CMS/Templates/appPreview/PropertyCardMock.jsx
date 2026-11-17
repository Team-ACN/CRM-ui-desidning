import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const HERO_TONES = ['#CBD5E1', '#D6D3D1', '#BFDBFE', '#FDE68A', '#BBF7D0'];

const SAMPLE = [
  { id: 'PB3864', name: 'Prestige Lakeside Habitat', sub: '3 BHK Apartment in Whitefield', price: '₹ 1.85 Cr', note: '₹ 9,250 / sq.ft', tags: ['East facing', 'Ready'] },
  { id: 'PB2217', name: 'Sobha Dream Acres', sub: '2 BHK Apartment in Panathur', price: '₹ 92 L', note: '₹ 7,100 / sq.ft', tags: ['North facing', 'Semi-furnished'] },
  { id: 'PB4410', name: 'Brigade Cornerstone Utopia', sub: '3 BHK Apartment in Varthur', price: '₹ 1.42 Cr', note: '₹ 8,300 / sq.ft', tags: ['West facing'] },
  { id: 'PB1093', name: 'Embassy Springs Villa', sub: '4 BHK Villa in Devanahalli', price: '₹ 3.6 Cr', note: '₹ 12,000 / sq.ft', tags: ['Corner', 'Gated'] },
  { id: 'PB5521', name: 'Godrej Woodscapes', sub: '2 BHK Apartment in Kanakapura', price: '₹ 78 L', note: '₹ 6,400 / sq.ft', tags: ['South facing'] },
];

/**
 * Compact replica of the app's PropertyCard.
 * `width` is the card width in px; `kind` shows the Resale / Rent chip.
 */
const PropertyCardMock = ({ index = 0, width = 270, kind, enquiry = false }) => {
  const p = SAMPLE[index % SAMPLE.length];
  const tone = HERO_TONES[index % HERO_TONES.length];

  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{ width, background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 12 }}
    >
      <div className="relative" style={{ height: 160, background: `linear-gradient(135deg, ${tone}, #F5F5F5)` }}>
        {kind && (
          <span
            className="absolute text-white"
            style={{ left: 12, top: 12, padding: '4px 10px', borderRadius: 35, background: 'rgba(38,38,38,0.6)', fontSize: 12, fontWeight: 600, lineHeight: '18px' }}
          >
            {kind === 'rental' ? 'Rent' : 'Resale'}
          </span>
        )}
        {enquiry && (
          <span
            className="absolute"
            style={{ right: 12, bottom: 12, padding: '4px 10px', borderRadius: 35, background: '#F3E8FF', color: '#9333EA', fontSize: 12, fontWeight: 700, lineHeight: '18px' }}
          >
            12 Mar
          </span>
        )}
      </div>

      <div style={{ padding: '12px 16px 8px' }} className="flex flex-col gap-2">
        <div className="flex items-center justify-between" style={{ fontSize: 12, color: '#404040', lineHeight: '18px' }}>
          <span>{p.id}</span>
          <span>Updated 2d ago</span>
        </div>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <p className="truncate" style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: '#262626' }}>{p.name}</p>
          <p className="truncate" style={{ fontSize: 14, lineHeight: '21px', color: '#262626' }}>{p.sub}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: 18, lineHeight: '27px', fontWeight: 600, color: '#262626' }}>{p.price}</span>
          <span style={{ fontSize: 12, color: '#525252' }}>{p.note}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span key={t} style={{ padding: '2px 8px', borderRadius: 6, background: '#F5F5F5', border: '1px solid #E5E5E5', fontSize: 11, color: '#404040' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ padding: '12px 16px', borderTop: '1px dashed #D4D4D4' }}>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>Contact</p>
          <p className="truncate" style={{ fontSize: 12, color: '#525252' }}>Ravi Kumar</p>
        </div>
        <span className="flex items-center justify-center text-white" style={{ width: 44, height: 44, borderRadius: 8, background: '#0F766E' }}>
          <Phone size={18} />
        </span>
        <span className="flex items-center justify-center text-white" style={{ width: 44, height: 44, borderRadius: 8, background: '#60D669' }}>
          <MessageCircle size={18} />
        </span>
      </div>
    </div>
  );
};

export default PropertyCardMock;
