'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Mindmap } from '@/types/mindmap';
import {
  createMindmap,
  renameMindmap,
  duplicateMindmap,
  deleteMindmap,
} from '@/lib/mindmap/actions';
import MindmapCard from './MindmapCard';
import CreateButton from './CreateButton';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import EmptyState from './EmptyState';
import UsageBadge from './UsageBadge';
import type { SortOption } from './SortDropdown';

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
}

export default function MindmapGrid({ initialMindmaps, count, isPro }: Props) {
  const router = useRouter();
  const [mindmaps, setMindmaps] = useState<Mindmap[]>(initialMindmaps);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('last-modified');

  // Filter by search query (client-side)
  const filtered = useMemo(() => {
    if (!search.trim()) return mindmaps;
    const q = search.toLowerCase();
    return mindmaps.filter((m) => m.title.toLowerCase().includes(q));
  }, [mindmaps, search]);

  // Sort (client-side)
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort(SORT_LOOKUP[sort]);
    return arr;
  }, [filtered, sort]);

  const handleCreate = async () => {
    const id = await createMindmap();
    router.push(`/editor/${id}`);
  };

  const handleRename = async (id: string, title: string) => {
    setMindmaps((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title } : m))
    );
    await renameMindmap(id, title);
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
    setMindmaps((prev) => prev.filter((m) => m.id !== id));
    await deleteMindmap(id);
  };

  const handleCardClick = (id: string) => {
    router.push(`/editor/${id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">My Mindmaps</h1>
          <UsageBadge count={count} isPro={isPro} />
        </div>
        <CreateButton onClick={handleCreate} count={count} isPro={isPro} />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          onCreateClick={handleCreate}
          hasSearch={search.trim().length > 0}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((mindmap) => (
            <MindmapCard
              key={mindmap.id}
              mindmap={mindmap}
              onRename={handleRename}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
