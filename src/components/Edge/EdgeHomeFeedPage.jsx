import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Check, X, Loader2, Newspaper, LayoutGrid, Image as ImageIcon, Trash2, GripHorizontal, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { getPosts, getProjects, getHomeFeed, updateHomeFeed, PAGE_ORDER_SECTIONS, PROJECT_PAGE_ORDER_SECTIONS } from '../../data/mockEdge';

const KIND_ICON = {
  article: <Newspaper size={14} />,
  carousel: <LayoutGrid size={14} />,
  video: <Newspaper size={14} />,
};

const KIND_COLOR = {
  article: 'bg-blue-50 text-blue-700',
  carousel: 'bg-purple-50 text-purple-700',
  video: 'bg-orange-50 text-orange-700',
};

export default function EdgeHomeFeedPage() {
  const [feed, setFeed] = useState([]);
  const [pageOrder, setPageOrder] = useState(PAGE_ORDER_SECTIONS.map(name => ({ name, hidden: false })));
  const [projectPageOrder, setProjectPageOrder] = useState(PROJECT_PAGE_ORDER_SECTIONS.map(name => ({ name, hidden: false })));
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [lookup, setLookup] = useState({});

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [draggedOrderIdx, setDraggedOrderIdx] = useState(null);
  const [draggedProjectOrderIdx, setDraggedProjectOrderIdx] = useState(null);

  const buildLookup = useCallback(() => {
    const posts = getPosts();
    const projects = getProjects();
    const map = {};
    for (const p of posts) {
      map[p.id] = { id: p.id, label: p.title, sub: p.is_live ? 'live' : 'draft', kind: 'post', type: p.type, is_live: p.is_live, cover_image_url: p.cover_image_url };
    }
    for (const p of projects) {
      map[p.id] = { id: p.id, label: p.name, sub: p.is_live ? 'live' : 'draft', kind: 'project', is_live: p.is_live, cover_image_url: p.cover_image_url };
    }
    setLookup(map);
  }, []);

  const loadFeed = useCallback(() => {
    setLoading(true);
    const data = getHomeFeed();
    setFeed(data.feed ?? []);
    if (data.page_order && data.page_order.length > 0) {
      setPageOrder(data.page_order);
    }
    if (data.project_page_order && data.project_page_order.length > 0) {
      setProjectPageOrder(data.project_page_order);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadFeed(); buildLookup(); }, [loadFeed, buildLookup]);

  function remove(i) { setFeed(feed.filter((_, idx) => idx !== i)); }

  function toggleFeed(id) {
    if (feed.includes(id)) {
      setFeed(feed.filter(x => x !== id));
    } else {
      setFeed([...feed, id]);
    }
    setSaveErr('');
  }

  function moveLeft(i) {
    if (i === 0) return;
    const arr = [...feed];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setFeed(arr);
  }

  function moveRight(i) {
    if (i === feed.length - 1) return;
    const arr = [...feed];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setFeed(arr);
  }

  function saveFeed() {
    setSaving(true);
    setSaveErr('');
    setSavedOk(false);
    try {
      updateHomeFeed({ feed, page_order: pageOrder, project_page_order: projectPageOrder });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleDragStart(e, idx) {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, idx) {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const arr = [...feed];
    const item = arr.splice(draggedIdx, 1)[0];
    arr.splice(idx, 0, item);
    setDraggedIdx(idx);
    setFeed(arr);
  }

  function handleDragEnd() {
    setDraggedIdx(null);
  }

  return (
    <div className="flex flex-col bg-stone-50 relative min-h-screen pb-24">

      <header className="h-16 flex items-center px-6 border-b border-stone-200 bg-white sticky top-0 z-40 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/edge" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/edge" className="text-base font-medium text-stone-500 hover:text-stone-700 transition-colors">Edge</Link>
            <span className="text-stone-300">/</span>
            <h1 className="text-base font-bold text-stone-900">Home Feed</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { loadFeed(); buildLookup(); }} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-neutral-900 transition-colors" title="Refresh">
            <RefreshCw size={18} />
          </button>
          {savedOk && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Check size={13} /> Saved
            </span>
          )}
          <button
            onClick={saveFeed}
            disabled={saving}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-950 text-white font-bold text-sm px-6 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving…' : 'Save Feed'}
          </button>
        </div>
      </header>

      <div className="w-full px-6 md:px-10 pt-8 space-y-8">

        {saveErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
            {saveErr}
            <button onClick={() => setSaveErr('')}><X size={14} /></button>
          </div>
        )}

        <div className="flex items-center gap-4 border-b border-stone-200 pb-px mb-8 w-full">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'feed' ? 'bg-neutral-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              Live Feed
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'order' ? 'bg-neutral-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              Page Order
            </button>
          </div>
        </div>

        {activeTab === 'order' && (
          <div className="mt-8 flex flex-wrap gap-8 items-start">
            <div className="flex-1 min-w-[320px] max-w-xl">
              <div className="flex items-center gap-3 mb-6 px-2">
                <h2 className="text-xl font-bold text-stone-900">Home Page Order</h2>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                <p className="text-stone-500 mb-6 text-sm px-2">Drag and drop the sections below to arrange how they appear on the frontend homepage.</p>
                <div className="flex flex-col gap-3">
                  {pageOrder.map((section, i) => {
                    const isDragging = draggedOrderIdx === i;
                    return (
                      <div
                        key={section.name}
                        draggable
                        onDragStart={(e) => { setDraggedOrderIdx(i); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedOrderIdx === null || draggedOrderIdx === i) return;
                          const newOrder = [...pageOrder];
                          const item = newOrder.splice(draggedOrderIdx, 1)[0];
                          newOrder.splice(i, 0, item);
                          setDraggedOrderIdx(i);
                          setPageOrder(newOrder);
                        }}
                        onDragEnd={() => setDraggedOrderIdx(null)}
                        className={`flex items-center gap-4 p-4 ${section.hidden ? 'bg-stone-100 border-stone-200/50' : 'bg-stone-50 border-stone-200'} border rounded-2xl transition-all ${isDragging ? 'opacity-50 scale-[0.98]' : 'hover:border-neutral-300 hover:shadow-sm cursor-grab active:cursor-grabbing'}`}
                      >
                        <GripHorizontal size={20} className="text-stone-400" />
                        <span className={`font-bold flex-1 ${section.hidden ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{section.name}</span>
                        <button
                          onClick={() => {
                            const newOrder = [...pageOrder];
                            newOrder[i] = { ...newOrder[i], hidden: !newOrder[i].hidden };
                            setPageOrder(newOrder);
                          }}
                          className={`p-2 rounded-xl transition-colors ${section.hidden ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-200' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={section.hidden ? 'Show Section' : 'Hide Section'}
                        >
                          {section.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[320px] max-w-xl">
              <div className="flex items-center gap-3 mb-6 px-2">
                <h2 className="text-xl font-bold text-stone-900">Project Page Order</h2>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                <p className="text-stone-500 mb-6 text-sm px-2">Drag and drop the sections below to arrange how they appear on the frontend Project page (/project).</p>
                <div className="flex flex-col gap-3">
                  {projectPageOrder.map((section, i) => {
                    const isDragging = draggedProjectOrderIdx === i;
                    return (
                      <div
                        key={section.name}
                        draggable
                        onDragStart={(e) => { setDraggedProjectOrderIdx(i); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedProjectOrderIdx === null || draggedProjectOrderIdx === i) return;
                          const newOrder = [...projectPageOrder];
                          const item = newOrder.splice(draggedProjectOrderIdx, 1)[0];
                          newOrder.splice(i, 0, item);
                          setDraggedProjectOrderIdx(i);
                          setProjectPageOrder(newOrder);
                        }}
                        onDragEnd={() => setDraggedProjectOrderIdx(null)}
                        className={`flex items-center gap-4 p-4 ${section.hidden ? 'bg-stone-100 border-stone-200/50' : 'bg-stone-50 border-stone-200'} border rounded-2xl transition-all ${isDragging ? 'opacity-50 scale-[0.98]' : 'hover:border-neutral-300 hover:shadow-sm cursor-grab active:cursor-grabbing'}`}
                      >
                        <GripHorizontal size={20} className="text-stone-400" />
                        <span className={`font-bold flex-1 ${section.hidden ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{section.name}</span>
                        <button
                          onClick={() => {
                            const newOrder = [...projectPageOrder];
                            newOrder[i] = { ...newOrder[i], hidden: !newOrder[i].hidden };
                            setProjectPageOrder(newOrder);
                          }}
                          className={`p-2 rounded-xl transition-colors ${section.hidden ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-200' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={section.hidden ? 'Show Section' : 'Hide Section'}
                        >
                          {section.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6 px-2">
              <h2 className="text-xl font-bold text-stone-900">Live Preview Order</h2>
              <span className="text-xs font-bold text-stone-400 px-3 py-1 bg-stone-100 rounded-full">{feed.length} post{feed.length !== 1 ? 's' : ''}</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-300">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : feed.length === 0 ? (
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center py-20 text-stone-400">
                <LayoutGrid size={32} className="mb-3 text-stone-300" />
                <p className="font-bold">Feed is empty</p>
                <p className="text-sm mt-1">Toggle posts below to add them to the feed</p>
              </div>
            ) : (
              <div className="flex flex-row overflow-x-auto gap-4 pb-8 px-2 snap-x hide-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                {feed.map((id, i) => {
                  const meta = lookup[id];
                  const typeKey = meta?.type ?? 'article';
                  const isDragging = draggedIdx === i;

                  return (
                    <div
                      key={`${id}-${i}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`relative flex-shrink-0 w-72 aspect-[5/7] rounded-[2rem] overflow-hidden shadow-sm group snap-center transition-transform duration-300 ${isDragging ? 'opacity-40 scale-95' : 'hover:-translate-y-2 hover:shadow-xl'}`}
                    >
                      {meta?.cover_image_url ? (
                        <img src={meta.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover z-0" draggable={false} />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-stone-100 flex items-center justify-center z-0">
                          <ImageIcon size={32} className="text-stone-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

                      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); moveLeft(i); }} className="w-8 h-8 bg-black/40 hover:bg-white hover:text-black rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white" disabled={i === 0}>
                          <ChevronLeft size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveRight(i); }} className="w-8 h-8 bg-black/40 hover:bg-white hover:text-black rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white" disabled={i === feed.length - 1}>
                          <ChevronRight size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="w-8 h-8 bg-black/40 hover:bg-red-500 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors shadow-sm ml-1">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="absolute top-3 left-3 z-30">
                        <div className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md cursor-grab active:cursor-grabbing shadow-sm" title="Drag to move">
                          <GripHorizontal size={15} />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/20">
                            {typeKey}
                          </span>
                          <span className="font-mono text-[10px] font-black text-white/70">{id}</span>
                        </div>
                        <p className="text-white font-medium text-base leading-tight line-clamp-4">
                          {meta ? meta.label : 'ID not found'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'feed' && !loading && Object.keys(lookup).length > 0 && (
          <div className="mt-12 bg-white border border-stone-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-6 px-2">All Posts (Toggle to Add/Remove)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 px-2">
              {Object.values(lookup).map((m) => {
                const inFeed = feed.includes(m.id);
                const typeKey = m.type ?? 'article';
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleFeed(m.id)}
                    className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm transition-all text-left ${inFeed ? 'ring-4 ring-neutral-500 scale-95 opacity-50' : 'hover:scale-105 hover:shadow-md border border-stone-200'}`}
                  >
                    {m.cover_image_url ? (
                      <img src={m.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover z-0" draggable={false} />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-stone-100 flex items-center justify-center z-0">
                        <ImageIcon size={24} className="text-stone-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

                    <div className="absolute top-2 left-2 z-20">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center ${KIND_COLOR[typeKey] ?? 'bg-stone-100 text-stone-400'}`}>
                        {KIND_ICON[typeKey]}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 z-20 flex flex-col justify-end">
                      <span className="font-mono text-[10px] font-black text-white">{m.id}</span>
                      <span className="text-[9px] font-medium text-white/80 line-clamp-1">{m.label}</span>
                    </div>

                    {inFeed && (
                      <div className="absolute inset-0 z-30 bg-neutral-500/20 flex items-center justify-center backdrop-blur-[1px]">
                        <Check size={24} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
