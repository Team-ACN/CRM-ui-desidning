import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, LayoutGrid, List as ListIcon, PlusCircle,
  ImageIcon, Loader2, Check, X, Copy, Search,
} from 'lucide-react';
import { getPosts } from '../../data/mockEdge';

const TYPE_COLORS = {
  article: 'bg-neutral-50 text-neutral-700',
  carousel: 'bg-purple-50 text-purple-700',
  video: 'bg-orange-50 text-orange-700',
};

export default function EdgePostsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [copiedCardId, setCopiedCardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshTick forces a re-read of the mutable mock store
  const posts = useMemo(() => getPosts({ type: filter }), [filter, refreshTick]);
  const loading = false;
  const refresh = () => setRefreshTick(t => t + 1);

  function openEdit(post) {
    navigate(`/edge/posts/${post.id}`);
  }

  function openCreate(type) {
    navigate(`/edge/posts/new?type=${type}`);
  }

  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const drafts = filteredPosts.filter(p => !p.is_live);
  const livePosts = filteredPosts.filter(p => p.is_live);

  const renderPost = (post) => {
    const isShareable = post.type === 'article' || post.type === 'carousel';

    return (
      <div
        key={post.id}
        onClick={() => openEdit(post)}
        className={`group bg-white border border-stone-200 overflow-hidden cursor-pointer transition-all hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 ${viewMode === 'grid'
          ? 'rounded-[2rem] hover:-translate-y-1 flex flex-col h-full min-h-[360px]'
          : 'rounded-2xl flex items-center h-36 hover:scale-[1.01]'
          }`}
      >
        {/* Image */}
        <div className={`bg-stone-100 overflow-hidden flex-shrink-0 relative ${viewMode === 'grid' ? 'h-48 w-full' : 'h-full w-36'}`}>
          {post.cover_image_url ? (
            <img src={post.cover_image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon size={28} /></div>
          )}
        </div>

        <div className={`flex flex-col ${viewMode === 'grid' ? 'p-5 flex-1' : 'p-5 flex-1 justify-center'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">{post.id}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${TYPE_COLORS[post.type]}`}>
              {post.type}
            </span>
            {!post.is_live && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                Draft
              </span>
            )}
          </div>

          <h3 className={`font-medium text-stone-900 leading-snug group-hover:text-neutral-900 transition-colors ${viewMode === 'grid' ? 'text-xl line-clamp-3' : 'text-lg line-clamp-2'}`}>
            {post.title}
          </h3>

          {viewMode === 'list' && post.summary && (
            <p className="text-sm text-stone-400 line-clamp-1 mt-1">{post.summary}</p>
          )}

          {/* Action buttons */}
          {isShareable && (
            <div
              className="flex gap-2 mt-auto pt-4 flex-wrap"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const url = post.type === 'carousel'
                    ? `https://acn-edge.vercel.app/?story=${post.id}&s=w`
                    : `https://acn-edge.vercel.app/?article=${post.id}&s=w`;
                  let msg = `*${post.title}*\n\n`;
                  if (post.summary) msg += `${post.summary}\n`;
                  msg += url;
                  navigator.clipboard.writeText(msg);
                  setCopiedCardId('copy-' + post.id);
                  setTimeout(() => setCopiedCardId(null), 2000);
                }}
                title="Copy for WhatsApp"
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
              >
                {copiedCardId === 'copy-' + post.id ? <><Check size={14} />Copied!</> : <><Copy size={14} />WhatsApp Copy</>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-stone-50 relative">

      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b border-stone-200 bg-white sticky top-0 z-30 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/edge" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/edge" className="text-base font-medium text-stone-500 hover:text-stone-700 transition-colors">Edge</Link>
            <span className="text-stone-300">/</span>
            <h1 className="text-base font-bold text-stone-900">Posts</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-400 px-3 py-1 bg-stone-100 rounded-full">{posts.length} posts</span>
          <div className="flex items-center bg-stone-100 rounded-full p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              title="List view"
            >
              <ListIcon size={16} />
            </button>
          </div>
          <button onClick={refresh} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-neutral-900 transition-colors" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Action Area */}
      <div className="px-6 py-6 border-b border-stone-200 bg-white flex-shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl">
          <button onClick={() => openCreate('article')} className="group flex flex-col items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 rounded-[2rem] p-6 transition-all border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-neutral-50 text-neutral-600 group-hover:bg-neutral-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-colors">
              <PlusCircle size={28} />
            </div>
            <span className="font-bold text-sm">New Article</span>
          </button>
          <button onClick={() => openCreate('carousel')} className="group flex flex-col items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 rounded-[2rem] p-6 transition-all border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-stone-50 text-stone-600 group-hover:bg-stone-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-colors">
              <PlusCircle size={28} />
            </div>
            <span className="font-bold text-sm">New Carousel</span>
          </button>
          <button onClick={() => openCreate('video')} className="group flex flex-col items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 rounded-[2rem] p-6 transition-all border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-stone-50 text-stone-600 group-hover:bg-stone-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-colors">
              <PlusCircle size={28} />
            </div>
            <span className="font-bold text-sm">New Video</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'article', 'carousel', 'video'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-neutral-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={`flex items-center justify-end transition-all duration-300 ease-in-out ${isSearchOpen ? 'flex-1 max-w-sm' : 'w-10'}`}>
            <div className={`relative flex items-center w-full bg-stone-100 rounded-full transition-all border ${isSearchOpen ? 'border-stone-200' : 'border-transparent'}`}>
              <button
                onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(''); }}
                className={`w-10 h-10 flex items-center justify-center text-stone-500 hover:text-neutral-900 flex-shrink-0 rounded-full z-10 transition-colors ${isSearchOpen ? 'bg-transparent' : 'bg-stone-100 hover:bg-stone-200'}`}
              >
                <Search size={18} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className={`w-full bg-transparent outline-none text-sm text-stone-800 pr-4 transition-all duration-300 h-10 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              />
              {isSearchOpen && searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6 bg-stone-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-300 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
          </div>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="mb-12">
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4 max-w-3xl mx-auto'}>
                  {drafts.map(renderPost)}
                </div>
              </div>
            )}
            {livePosts.length > 0 && (
              <div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4 max-w-3xl mx-auto'}>
                  {livePosts.map(renderPost)}
                </div>
              </div>
            )}
            {filteredPosts.length === 0 && (
              <div className="text-center text-stone-400 py-12">No posts found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
