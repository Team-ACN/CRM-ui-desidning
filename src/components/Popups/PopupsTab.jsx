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
    <p className="text-[11px] font-medium text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{value}</p>
  </div>
);

// Both surfaces are always on screen — the panel you're viewing is the highlighted one,
// and clicking the other switches the list below to it.
const SurfacePanel = ({ label, stats, isActive, onSelect }) => (
  <button
    onClick={onSelect}
    className={`text-left bg-white border rounded-xl px-5 py-4 transition-colors cursor-pointer ${
      isActive ? 'border-gray-900 shadow-sm' : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{label}</span>
      <span className={`text-[10px] font-medium ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
        {isActive ? 'Viewing' : 'View'}
      </span>
    </div>
    <div className="grid grid-cols-4 gap-3">
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
    <div className="px-6 pb-12 space-y-5">
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
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="flex items-center justify-center text-gray-300 mb-3">
            <MonitorSmartphone size={36} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {searchQuery ? 'No popups match that search' : 'No popups here yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? 'Try a different name.'
              : 'Upload a creative, pick a layout, and the system renders the CTA.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <PopupGroup
              key={group.key}
              group={group}
              onPreview={setViewingPopup}
              onEdit={onEdit}
              onToggle={onToggle}
            />
          ))}
          <p className="text-[11px] text-gray-400 px-4">
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
