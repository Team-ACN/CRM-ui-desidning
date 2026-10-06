import React, { useMemo, useState } from 'react';
import { MonitorSmartphone } from 'lucide-react';
import PopupsToolbar from './PopupsToolbar';
import PopupGroup from './PopupGroup';
import PopupViewModal from './PopupViewModal';
import { groupPopupsByContext } from './groupPopups';
import { aggregateStats, formatCount, formatPct } from './popupStats';

const matchesSurface = (popup, surface) => popup.surface === surface;

const Kpi = ({ label, value }) => (
  <div>
    <p className="text-[24px] leading-7 font-semibold tracking-[-0.02em] text-label tabular-nums">{value}</p>
    <p className="text-[13px] text-secondary mt-1">{label}</p>
  </div>
);

// Both surfaces are always on screen — the panel you're viewing is the highlighted one,
// and clicking the other switches the list below to it.
const SurfacePanel = ({ label, stats, isActive, onSelect }) => (
  <button
    onClick={onSelect}
    className={`text-left bg-surface rounded-2xl px-5 py-4 cursor-pointer transition-[transform,box-shadow,background-color] duration-100 ease-out active:scale-[0.99] ${
      isActive ? 'ring-2 ring-accent' : 'shadow-card hover:bg-black/[0.01]'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-label">{label}</span>
      <span className={`text-[13px] ${isActive ? 'text-accent font-medium' : 'text-tertiary'}`}>
        {isActive ? 'Viewing' : 'View'}
      </span>
    </div>
    <div className="grid grid-cols-4 gap-4">
      <Kpi label="Live" value={stats.liveCount} />
      <Kpi label="Impressions" value={formatCount(stats.impressions)} />
      <Kpi label="Avg CTR" value={formatPct(stats.ctr)} />
      <Kpi label="Dismiss" value={formatPct(stats.dismissRate)} />
    </div>
  </button>
);

const PopupsTab = ({
  popups,
  cohorts,
  surface,
  onSurfaceChange,
  onCreate,
  onEdit,
  onManagePriority,
  onToggle,
  onSetStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPopup, setViewingPopup] = useState(null);

  const surfacePopups = useMemo(
    () => popups.filter((p) => matchesSurface(p, surface)),
    [popups, surface]
  );

  const visiblePopups = useMemo(
    () => surfacePopups.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [surfacePopups, searchQuery]
  );

  const groups = useMemo(() => groupPopupsByContext(visiblePopups), [visiblePopups]);
  const appTotals = useMemo(() => aggregateStats(popups.filter((p) => p.surface === 'app')), [popups]);
  const webTotals = useMemo(() => aggregateStats(popups.filter((p) => p.surface === 'web')), [popups]);

  return (
    <div className="px-8 pb-12 space-y-6">
      {/* Performance at a glance — both surfaces, kept apart */}
      <div className="grid grid-cols-2 gap-4">
        <SurfacePanel
          label="App"
          stats={appTotals}
          isActive={surface === 'app'}
          onSelect={() => onSurfaceChange('app')}
        />
        <SurfacePanel
          label="Web"
          stats={webTotals}
          isActive={surface === 'web'}
          onSelect={() => onSurfaceChange('web')}
        />
      </div>

      <PopupsToolbar
        surface={surface}
        onSurfaceChange={onSurfaceChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onManagePriority={() => onManagePriority(surfacePopups)}
        onCreate={() => onCreate(surface)}
      />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 bg-surface rounded-2xl shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-fill flex items-center justify-center text-secondary mb-4">
            <MonitorSmartphone size={22} strokeWidth={1.75} />
          </div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">
            {searchQuery ? 'No popups match that search' : 'No popups here yet'}
          </h3>
          <p className="text-[13px] text-secondary mt-1">
            {searchQuery
              ? 'Try a different name.'
              : 'Upload a creative, pick a layout, and the system renders the CTA.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <PopupGroup
              key={group.key}
              group={group}
              onPreview={setViewingPopup}
              onEdit={onEdit}
              onToggle={onToggle}
            />
          ))}
          <p className="text-[12px] text-secondary px-4">
            Only one popup shows per view — use Manage priority to change which one wins its slot.
          </p>
        </div>
      )}

      <PopupViewModal
        isOpen={!!viewingPopup}
        popup={viewingPopup}
        cohorts={cohorts}
        onClose={() => setViewingPopup(null)}
        onMakeLive={(popupId) => {
          onSetStatus(popupId, 'Live');
          setViewingPopup(null);
        }}
      />
    </div>
  );
};

export default PopupsTab;
