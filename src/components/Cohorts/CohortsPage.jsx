import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, ArrowUpDown, LayoutTemplate, Activity, Users, Layers } from 'lucide-react';
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
import { mockCohorts as initialCohorts, mockTemplates as initialTemplates, mockComponents as initialComponents } from '../../data/mockCohorts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} /> },
  { id: 'components', label: 'Components', icon: <Layers size={18} /> },
  { id: 'cohorts', label: 'Cohorts', icon: <Users size={18} /> },
];

const CohortsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pageType, setPageType] = useState('HOME');
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [templates, setTemplates] = useState(initialTemplates);
  const [components, setComponents] = useState(initialComponents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
      id: Date.now(),
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
    setEditingTemplate({ cohortId: presetCohortId, pageType });
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

  // Filter templates by selected pageType
  const activeTemplates = useMemo(() => {
    return templates.filter((t) => t.pageType === pageType);
  }, [templates, pageType]);

  // Full-page views
  if (currentView === 'builder') {
    return (
      <>
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
        />
        <CreateCohortModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateCohort}
        />
      </>
    );
  }

  if (currentView === 'priority') {
    return (
      <PriorityManager
        templates={activeTemplates}
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
      />
    );
  }

  return (
    <div className="pb-8">
      {/* Header with tabs */}
      <header className="bg-white border-b border-gray-200">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">CMS</h1>
            
            {/* Page Context Switcher (Segmented Control) */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setPageType('HOME')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  pageType === 'HOME'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                Home Page
              </button>
              <button
                onClick={() => setPageType('PROPERTIES')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  pageType === 'PROPERTIES'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                Properties Page
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(activeTab === 'cohorts' || activeTab === 'templates') && (
              <>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeTab === 'cohorts' ? "Search cohorts..." : "Search templates..."}
                    className="pl-10 pr-4 py-2 w-56 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                
                {activeTab === 'cohorts' ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={18} />
                    Create Cohort
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentView('priority')}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <ArrowUpDown size={16} />
                      Manage Priority
                    </button>
                    <button
                      onClick={() => handleCreateTemplate()}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Plus size={18} />
                      Create Template
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </header>
      
      {/* Tabs Menu */}
      <div className="bg-white border-b border-gray-200 px-6 mb-6 sticky top-0 z-10">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto mt-6">
        {activeTab === 'overview' && (
          <LiveOverview
            cohorts={cohorts}
            templates={activeTemplates}
            onCreateTemplate={() => handleCreateTemplate(null)}
          />
        )}

        {activeTab === 'cohorts' && (
          <div className="p-6 space-y-3">
            {filteredCohorts.map((cohort) => (
              <CohortCard 
                key={cohort.id} 
                cohort={cohort} 
                onView={(c) => setViewingCohort(c)}
              />
            ))}
            {filteredCohorts.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No cohorts found.
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
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CohortsPage;
