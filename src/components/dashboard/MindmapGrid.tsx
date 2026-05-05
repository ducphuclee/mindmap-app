'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Mindmap } from '@/types/mindmap';
import {
  createMindmap,
  renameMindmap,
  duplicateMindmap,
  deleteMindmap,
} from '@/lib/mindmap/actions';
import MindmapCard from './MindmapCard';
import MindmapCardSkeleton from './MindmapCardSkeleton';
import CreateButton from './CreateButton';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import EmptyState from './EmptyState';
import UsageBadge from './UsageBadge';
import DeleteConfirmModal from './DeleteConfirmModal';
import RenameDialog from './RenameDialog';
import type { SortOption } from './SortDropdown';

function loadStarredIds(): Set<string> {
  try {
    const raw = localStorage.getItem('starredIds');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveStarredIds(ids: Set<string>) {
  try {
    localStorage.setItem('starredIds', JSON.stringify([...ids]));
  } catch {
    // localStorage may be full or unavailable
  }
}

type FilterTab = 'all' | 'starred';

type SortFn = (a: Mindmap, b: Mindmap) => number;

const SORT_LOOKUP: Record<SortOption, SortFn> = {
  'last-modified': (a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
};

interface Props {
  initialMindmaps: Mindmap[];
  count: number;
  isPro: boolean;
  isLoading?: boolean;
  currentUserId: string;
}

export default function MindmapGrid({ initialMindmaps, count, isPro, isLoading, currentUserId }: Props) {
  const router = useRouter();
  const [mindmaps, setMindmaps] = useState<Mindmap[]>(initialMindmaps);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('last-modified');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRenameId, setPendingRenameId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(loadStarredIds);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const pendingDeleteMindmap = pendingDeleteId
    ? mindmaps.find((m) => m.id === pendingDeleteId) ?? null
    : null;

  const pendingRenameMindmap = pendingRenameId
    ? mindmaps.find((m) => m.id === pendingRenameId) ?? null
    : null;

  // Filter: tab → search → sort
  const filtered = useMemo(() => {
    let result = mindmaps;

    if (filterTab === 'starred') {
      result = result.filter((m) => starredIds.has(m.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    return result;
  }, [mindmaps, filterTab, search, starredIds]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort(SORT_LOOKUP[sort]);
    return arr;
  }, [filtered, sort]);

  const handleCreate = async () => {
    const id = await createMindmap();
    router.push(`/editor/${id}`);
  };

  const handleDuplicate = async (id: string) => {
    const newId = await duplicateMindmap(id);
    const original = mindmaps.find((m) => m.id === id);
    if (original) {
      const newMindmap: Mindmap = {
        ...original,
        id: newId,
        title: `${original.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMindmaps((prev) => [newMindmap, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = mindmaps;
    setMindmaps((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMindmap(id);
    } catch {
      setMindmaps(snapshot);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleRenameRequest = (id: string) => {
    setPendingRenameId(id);
  };

  const handleRenameSubmit = async (newTitle: string) => {
    if (!pendingRenameId) return;
    const id = pendingRenameId;
    setMindmaps((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m))
    );
    await renameMindmap(id, newTitle);
  };

  const handleStarToggle = useCallback((id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveStarredIds(next);
      return next;
    });
  }, []);

  const tabClass = (tab: FilterTab) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      filterTab === tab
        ? 'bg-blue-600 text-white dark:bg-blue-700'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Mindmaps</h1>
          <UsageBadge count={count} isPro={isPro} />
        </div>
        <CreateButton onClick={handleCreate} count={count} isPro={isPro} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button className={tabClass('all')} onClick={() => setFilterTab('all')}>
          All
        </button>
        <button className={tabClass('starred')} onClick={() => setFilterTab('starred')}>
          Starred
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MindmapCardSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          onCreateClick={handleCreate}
          hasSearch={search.trim().length > 0}
          filterTab={filterTab}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((mindmap) => (
            <MindmapCard
              key={mindmap.id}
              mindmap={mindmap}
              currentUserId={currentUserId}
              onDuplicate={handleDuplicate}
              onDeleteRequest={handleDeleteRequest}
              onRenameRequest={handleRenameRequest}
              onClick={handleCardClick}
              isStarred={starredIds.has(mindmap.id)}
              onStarToggle={handleStarToggle}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!pendingDeleteMindmap}
        title={pendingDeleteMindmap?.title ?? ''}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          handleDelete(pendingDeleteId!);
          setPendingDeleteId(null);
        }}
      />

      {/* Rename dialog */}
      <RenameDialog
        isOpen={pendingRenameId !== null}
        onClose={() => setPendingRenameId(null)}
        currentTitle={pendingRenameMindmap?.title ?? ''}
        onRename={handleRenameSubmit}
      />
    </div>
  );
}
