import React, { useState, useMemo, useRef } from 'react';
import { Plus, ArrowUpDown, LayoutTemplate, Activity, Users, Layers, Lock, MessageSquareDashed, Check } from 'lucide-react';
import CohortCard from './CohortCard';
import CreateCohortModal from './CreateCohortModal';
import LiveOverview from './LiveOverview';
import TemplatesTab from './TemplatesTab';
import TemplateBuilder from './TemplateBuilder';
import PriorityManager from './PriorityManager';
import CohortViewModal from './CohortViewModal';
import TemplateViewModal from './TemplateViewModal';
import ComponentsTab from './ComponentsTab';
import ComponentBuilderModal from './ComponentBuilderModal';
import PopupsTab from '../Popups/PopupsTab';
import PopupBuilder from '../Popups/PopupBuilder';
import PopupPriorityManager from '../Popups/PopupPriorityManager';
import PopupViewModal from '../Popups/PopupViewModal';
import { usePopups, createEmptyPopup } from '../Popups/usePopups';
import { Button, SegmentedControl, SearchField, ListGroup, pageTitleClass } from '../cms-ui';
import { mockCohorts as initialCohorts, mockTemplates as initialTemplates, mockComponents as initialComponents } from '../../data/mockCohorts';

const TABS = [
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={16} strokeWidth={1.75} /> },
  { id: 'components', label: 'Components', icon: <Layers size={16} strokeWidth={1.75} /> },
  { id: 'popups', label: 'Popups', icon: <MessageSquareDashed size={16} strokeWidth={1.75} /> },
  { id: 'cohorts', label: 'Cohorts', icon: <Users size={16} strokeWidth={1.75} /> },
  { id: 'overview', label: 'Overview', icon: <Activity size={16} strokeWidth={1.75} />, locked: true },
];

const PAGE_TYPES = [
  { value: 'HOME', label: 'Home Page' },
  { value: 'PROPERTIES', label: 'Properties Page' },
  { value: 'WEBSITE', label: 'Website Page' },
];

const CohortsPage = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [pageType, setPageType] = useState('HOME');
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [templates, setTemplates] = useState(initialTemplates);
  const [components, setComponents] = useState(initialComponents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [selectedBaseWidget, setSelectedBaseWidget] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Popups own their state in the Popups module; this page only routes views.
  const { popups, savePopup, setStatus, toggleLive, reorderPriority } = usePopups();
  const [popupSurface, setPopupSurface] = useState('app');
  const [editingPopup, setEditingPopup] = useState(null);
  const [priorityPopups, setPriorityPopups] = useState([]);
  const [viewingPopup, setViewingPopup] = useState(null);
  
  // Ref to communicate back to the template builder active widget
  const onInlineComponentCreatedRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // View state: 'tabs' | 'builder' | 'priority'
  const [currentView, setCurrentView] = useState('tabs');
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Detail modals state
  const [viewingCohort, setViewingCohort] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  // Ref to set cohort ID in the builder after creating a cohort from the modal
  const setCohortIdRef = useRef(null);

  const filteredCohorts = useMemo(() => {
    if (!searchQuery.trim()) return cohorts;
    return cohorts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cohorts, searchQuery]);



  const handleCreateCohort = (newCohort) => {
    const cohort = {
      id: `COH${String(Date.now()).slice(-6)}`,
      name: newCohort.name,
      description: newCohort.description || 'No description',
      tags: [newCohort.type.toUpperCase()],
      agentCount: 0,
    };
    setCohorts((prev) => [...prev, cohort]);
    // If we're in the builder, auto-select the new cohort in the dropdown
    if (currentView === 'builder' && setCohortIdRef.current) {
      setCohortIdRef.current(cohort.id);
    }
  };

  // Template actions
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setCurrentView('builder');
  };

  const handleCreateTemplate = (presetCohortId) => {
    setEditingTemplate({ cohortIds: presetCohortId ? [presetCohortId] : [], pageType });
    setCurrentView('builder');
  };

  const handleSaveTemplate = (templateData) => {
    setTemplates((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === templateData.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = templateData;
        return updated;
      }
      return [...prev, templateData];
    });
    setCurrentView('tabs');
    setEditingTemplate(null);
    setActiveTab('templates');
  };

  const handlePrioritySave = (reorderedTemplates) => {
    setTemplates(reorderedTemplates);
    setCurrentView('tabs');
    setActiveTab('templates');
  };

  const handleMakeLive = (templateId) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, status: 'Live', isActive: true }
          : t
      )
    );
    setViewingTemplate(null);
  };

  // Filter templates by selected pageType
  const activeTemplates = useMemo(() => {
    return templates.filter((t) => t.pageType === pageType);
  }, [templates, pageType]);

  // Popup view routing
  const handleCreatePopup = (surface) => {
    setEditingPopup(createEmptyPopup(surface));
    setCurrentView('popupBuilder');
  };

  const handleEditPopup = (popup) => {
    setEditingPopup(popup);
    setCurrentView('popupBuilder');
  };

  const handleSavePopup = (popupData) => {
    savePopup(popupData);
    setCurrentView('tabs');
    setEditingPopup(null);
    setActiveTab('popups');
    showToast(`Popup ${popupData.id} saved as ${popupData.status}`);
  };

  const handleManagePopupPriority = (scopedPopups) => {
    setPriorityPopups(scopedPopups);
    setCurrentView('popupPriority');
  };

  // Full-page views
  if (currentView === 'popupPriority') {
    const livePopup = (popupId) => {
      setStatus(popupId, 'Live');
      setPriorityPopups((prev) =>
        prev.map((p) => (p.id === popupId ? { ...p, status: 'Live', isActive: true } : p))
      );
      setViewingPopup(null);
    };

    return (
      <div className="cms bg-canvas min-h-screen">
        <PopupPriorityManager
          popups={priorityPopups}
          surface={popupSurface}
          onSave={(reordered) => {
            reorderPriority(reordered);
            setCurrentView('tabs');
            setActiveTab('popups');
            showToast('Popup priority updated');
          }}
          onBack={() => {
            setCurrentView('tabs');
            setViewingPopup(null);
          }}
          onPreview={(popup) => setViewingPopup(popup)}
          onToggleActive={(popupId) => {
            const target = priorityPopups.find((p) => p.id === popupId);
            const nextStatus = target?.isActive ? 'Off' : 'Live';
            setStatus(popupId, nextStatus);
            setPriorityPopups((prev) =>
              prev.map((p) =>
                p.id === popupId ? { ...p, status: nextStatus, isActive: nextStatus === 'Live' } : p
              )
            );
          }}
        />
        <PopupViewModal
          isOpen={!!viewingPopup}
          popup={viewingPopup}
          cohorts={cohorts}
          onClose={() => setViewingPopup(null)}
          onMakeLive={livePopup}
        />
      </div>
    );
  }

  if (currentView === 'popupBuilder') {
    return (
      <div className="cms bg-canvas min-h-screen">
        <PopupBuilder
          popup={editingPopup}
          cohorts={cohorts}
          onSave={handleSavePopup}
          onBack={() => {
            setCurrentView('tabs');
            setEditingPopup(null);
          }}
        />
      </div>
    );
  }

  if (currentView === 'builder') {
    return (
      <div className="cms bg-canvas min-h-screen">
        <TemplateBuilder
          template={editingTemplate}
          pageType={pageType}
          cohorts={cohorts}
          components={components}
          onSave={handleSaveTemplate}
          onBack={() => {
            setCurrentView('tabs');
            setEditingTemplate(null);
          }}
          onOpenCohortModal={() => setIsModalOpen(true)}
          setCohortIdRef={setCohortIdRef}
          onOpenComponentBuilder={(widgetType, onCreatedCallback) => {
            setSelectedBaseWidget(widgetType);
            setIsComponentModalOpen(true);
            onInlineComponentCreatedRef.current = onCreatedCallback;
          }}
        />
        <CreateCohortModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateCohort}
        />
        <ComponentBuilderModal
          isOpen={isComponentModalOpen}
          onClose={() => {
            setIsComponentModalOpen(false);
            setSelectedBaseWidget('');
          }}
          pageType={pageType}
          initialSelectedType={selectedBaseWidget}
          existingComponents={components}
          onSave={(newComponent) => {
            setComponents((prev) => [...prev, newComponent]);
            setIsComponentModalOpen(false);
            showToast(`Component ${newComponent.id} saved successfully`);
            
            // If opened from a template widget, notify the widget to use this new component
            if (onInlineComponentCreatedRef.current) {
              onInlineComponentCreatedRef.current(newComponent);
              onInlineComponentCreatedRef.current = null;
            }
          }}
        />
      </div>
    );
  }

  if (currentView === 'priority') {
    const priorityTemplates = activeTemplates.filter(t => t.status !== 'Draft');
    return (
      <div className="cms bg-canvas min-h-screen">
        <PriorityManager
          templates={priorityTemplates}
          cohorts={cohorts}
          onSave={(reordered) => {
            // Merge reordered subset back into the master list
            setTemplates((prev) => {
              const others = prev.filter(t => t.pageType !== pageType);
              return [...others, ...reordered];
            });
            setCurrentView('tabs');
            setActiveTab('templates');
          }}
          onBack={() => setCurrentView('tabs')}
          onPreview={(template) => setViewingTemplate(template)}
        />
        
        <TemplateViewModal
          isOpen={!!viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          template={viewingTemplate}
          onMakeLive={handleMakeLive}
        />
      </div>
    );
  }

  return (
    <div className="cms bg-canvas min-h-screen pb-8">
      {/* Page header */}
      <header className="px-8 pt-8 pb-5">
        <h1 className={pageTitleClass}>CMS</h1>
        <p className="mt-1 text-[13px] text-secondary">Manage what agents see across app and website</p>
      </header>

      {/* Tabs Menu */}
      <div className="material bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border-b border-separator px-8 sticky top-0 z-10">
        <div role="tablist" className="flex gap-7">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => !tab.locked && setActiveTab(tab.id)}
              disabled={tab.locked}
              className={`relative flex items-center gap-2 h-11 text-[14px] font-medium transition-colors ${
                tab.locked
                  ? 'text-tertiary cursor-not-allowed'
                  : activeTab === tab.id
                    ? 'text-label'
                    : 'text-secondary hover:text-label'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.locked && <Lock size={12} strokeWidth={1.75} className="text-tertiary" />}
              <span
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent transition-opacity duration-200 ${
                  !tab.locked && activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto mt-8">
        {/* In-page toolbar: Page Switcher + Actions — the Popups tab brings its own */}
        {activeTab !== 'popups' && (
        <div className="px-8 mb-6 flex items-center justify-between gap-4">
          {/* Page Context Switcher (Segmented Control) — hidden on Cohorts tab */}
          {activeTab !== 'cohorts' ? (
            <SegmentedControl options={PAGE_TYPES} value={pageType} onChange={setPageType} />
          ) : <div />}

          {/* Right side: search + tab-specific actions */}
          <div className="flex items-center gap-2">
            {/* Search — shown for templates and cohorts */}
            {(activeTab === 'templates' || activeTab === 'cohorts') && (
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={activeTab === 'cohorts' ? "Search cohorts" : "Search templates"}
                className="w-56 mr-1"
              />
            )}

            {/* Template actions */}
            {activeTab === 'templates' && (
              <>
                <Button icon={ArrowUpDown} onClick={() => setCurrentView('priority')}>
                  Manage Priority
                </Button>
                <Button variant="primary" icon={Plus} onClick={() => handleCreateTemplate()}>
                  Create Template
                </Button>
              </>
            )}

            {/* Cohort actions */}
            {activeTab === 'cohorts' && (
              <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                Create Cohort
              </Button>
            )}

            {/* Component actions */}
            {activeTab === 'components' && (
              <Button variant="primary" icon={Plus} onClick={() => setCurrentView('componentBuilder')}>
                Create Component
              </Button>
            )}
          </div>
        </div>
        )}

        {activeTab === 'popups' && (
          <PopupsTab
            popups={popups}
            cohorts={cohorts}
            surface={popupSurface}
            onSurfaceChange={setPopupSurface}
            onCreate={handleCreatePopup}
            onEdit={handleEditPopup}
            onManagePriority={handleManagePopupPriority}
            onToggle={toggleLive}
            onSetStatus={setStatus}
          />
        )}

        {activeTab === 'overview' && (
          <LiveOverview
            cohorts={cohorts}
            templates={activeTemplates}
            onCreateTemplate={() => handleCreateTemplate(null)}
          />
        )}

        {activeTab === 'cohorts' && (
          <div className="px-8">
            {filteredCohorts.length > 0 && (
              <ListGroup>
                {filteredCohorts.map((cohort) => (
                  <CohortCard 
                    key={cohort.id} 
                    cohort={cohort} 
                    onView={(c) => setViewingCohort(c)}
                  />
                ))}
              </ListGroup>
            )}
            {filteredCohorts.length === 0 && (
              <div className="flex flex-col items-center text-center py-16">
                <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-3">
                  <Users size={20} strokeWidth={1.75} className="text-secondary" />
                </div>
                <p className="text-[15px] font-semibold text-label">No cohorts found</p>
                <p className="mt-1 text-[13px] text-secondary">Try a different search, or create a new cohort.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            templates={activeTemplates}
            setTemplates={setTemplates}
            onEditTemplate={handleEditTemplate}
            onPreviewTemplate={(t) => setViewingTemplate(t)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'components' && (
          <ComponentsTab 
            components={components}
            pageType={pageType}
            searchQuery={searchQuery}
            onCreateComponent={() => setCurrentView('componentBuilder')}
          />
        )}
      </main>

      {/* Create Cohort Modal */}
      <CreateCohortModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCohort}
      />

      {/* View Modals */}
      <CohortViewModal
        isOpen={!!viewingCohort}
        onClose={() => setViewingCohort(null)}
        cohort={viewingCohort}
        templates={templates}
      />
      
      <TemplateViewModal
        isOpen={!!viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        template={viewingTemplate}
        onMakeLive={handleMakeLive}
      />

      <ComponentBuilderModal
        isOpen={currentView === 'componentBuilder'}
        onClose={() => setCurrentView('tabs')}
        pageType={pageType}
        existingComponents={components}
        onSave={(newComponent) => {
          setComponents((prev) => [...prev, newComponent]);
          setCurrentView('tabs');
          showToast(`Component ${newComponent.id} saved successfully`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 pl-3 pr-4 h-11 bg-label/90 backdrop-blur-xl text-white rounded-full shadow-raised animate-sheet-in">
          <div className="w-5 h-5 bg-positive-dot rounded-full flex items-center justify-center">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CohortsPage;
