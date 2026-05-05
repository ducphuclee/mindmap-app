import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { MindmapData, MindmapNodeData } from '@/types/mindmap';
import { saveMindmapData } from '@/lib/mindmap/actions';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  id: string;
  nodes: Node<MindmapNodeData>[];
  edges: Edge[];
  layoutType?: 'radial' | 'tree-td' | 'tree-lr';
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  status: SaveStatus;
}

export function useAutoSave({
  id,
  nodes,
  edges,
  layoutType,
  debounceMs = 500,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the initial render (don't auto-save on mount)
  const isFirstRender = useRef(true);

  const save = useCallback(
    async (data: MindmapData) => {
      setStatus('saving');
      try {
        await saveMindmapData(id, data);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [id],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setStatus('saving');

    // Convert React Flow nodes/edges to our MindmapData format
    const data: MindmapData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
        selected: n.selected,
        parentId: n.parentId,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        animated: e.animated,
      })),
      layoutType,
    };

    timerRef.current = setTimeout(() => {
      save(data);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, debounceMs, save]);

  return { status };
}
