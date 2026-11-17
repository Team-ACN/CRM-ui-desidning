import React from 'react';
import { Search } from 'lucide-react';
import lockImg from '../../../../assets/appPreview/VerificationLock.png';
import leafImg from '../../../../assets/appPreview/leaf.png';
import legal from '../../../../assets/appPreview/services-icons/legal.png';
import ekhata from '../../../../assets/appPreview/services-icons/e-khata.png';
import ec from '../../../../assets/appPreview/services-icons/ec.png';
import registry from '../../../../assets/appPreview/services-icons/registry.png';
import mou from '../../../../assets/appPreview/services-icons/mou.png';
import deed from '../../../../assets/appPreview/services-icons/deed.png';
import khata from '../../../../assets/appPreview/services-icons/khata.png';
import rental from '../../../../assets/appPreview/services-icons/rental.png';

/** Verification banner shown on Home / Properties for unverified agents. */
export const VerificationBanner = ({ status = 'unverified' }) => {
  const pending = status === 'pending';
  return (
    <div
      className="flex items-center gap-3"
      style={{
        margin: '16px 16px 0',
        padding: 14,
        borderRadius: 12,
        background: pending ? '#FCFAE4' : '#FFE2E2',
        border: `1px solid ${pending ? '#FDE68A' : '#FDA4AF'}`,
      }}
    >
      <img src={lockImg} alt="" style={{ width: 36, height: 36 }} />
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 14, fontWeight: 600, color: pending ? '#854D0E' : '#BE123C' }}>Verification Pending</p>
        <p style={{ fontSize: 12, color: '#525252' }}>Verify your account to unlock all features.</p>
      </div>
      {!pending && (
        <span style={{ padding: '6px 12px', borderRadius: 8, background: '#0F766E', color: '#fff', fontSize: 12, fontWeight: 600 }}>Verify Now</span>
      )}
    </div>
  );
};

/** Footer for Home / Properties. */
export const ExploreFooter = () => (
  <div className="flex flex-col items-center" style={{ padding: '40px 16px 48px' }}>
    <img src={leafImg} alt="" style={{ width: 56, opacity: 0.8 }} />
    <p style={{ fontSize: 14, color: '#737373', marginTop: 8 }}>You&apos;re all caught up</p>
  </div>
);

const SERVICE_LIST = [
  ['Legal', legal], ['E-Khata', ekhata], ['EC', ec], ['Registry', registry],
  ['MoU', mou], ['Sale deed', deed], ['Khata', khata], ['Rental', rental],
];
const PASTELS = ['#EADBDE', '#DCE9BB', '#E8F3C9', '#CCD1F1', '#EFE9C5', '#F1E8C9'];
const FAQS = ['What is Khata transfer?', 'How long does registry take?', 'Do I need an EC?', 'How are fees charged?', 'Can I track my case?', 'Who handles documents?'];

/** Footer of the Services page: referral block, directory, FAQs. */
export const ServicesFooter = () => (
  <div>
    <div className="flex flex-col justify-center" style={{ margin: '24px 16px 0', height: 184, borderRadius: 16, padding: 20, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>
      <p style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>Earn Flat 25% on each referral</p>
      <p style={{ fontSize: 13, color: '#DBEAFE', marginTop: 4 }}>Refer clients to ACN services.</p>
    </div>

    <div style={{ padding: '24px 16px 0' }}>
      <div className="flex items-center gap-2" style={{ height: 60, borderRadius: 12, background: '#FAFAFA', border: '1px solid #D4D4D4', padding: '0 14px' }}>
        <Search size={18} color="#737373" />
        <span style={{ fontSize: 14, color: '#737373' }}>Search E-Khata</span>
      </div>
      <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 16 }}>
        {SERVICE_LIST.map(([name, icon], i) => (
          <div key={name} className="flex flex-col items-center" style={{ background: PASTELS[i % PASTELS.length], borderRadius: 14, padding: '14px 8px' }}>
            <img src={icon} alt="" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: '#262626', marginTop: 6 }}>{name}</p>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '32px 16px 48px' }}>
      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#404040', marginBottom: 12 }}>FAQs</h3>
      {FAQS.map((q) => (
        <div key={q} style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E5', fontSize: 14, color: '#262626' }}>{q}</div>
      ))}
      <div className="flex justify-center" style={{ marginTop: 20 }}>
        <span style={{ padding: '10px 24px', borderRadius: 10, background: '#0F766E', color: '#fff', fontSize: 14, fontWeight: 600 }}>Contact Us</span>
      </div>
    </div>
  </div>
);
