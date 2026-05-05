import { useCallback, useRef, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  pushSnapshot: (snapshot: Snapshot) => void;
  undo: () => Snapshot | null;
  redo: () => Snapshot | null;
}

export function useUndoRedo(): UseUndoRedoReturn {
  // history[0] is oldest, history[cursor] is current
  const historyRef = useRef<Snapshot[]>([]);
  const cursorRef = useRef<number>(-1);
  // Force re-renders when undo/redo state changes
  const [, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const pushSnapshot = useCallback(
    (snapshot: Snapshot) => {
      // Truncate any redo history beyond current cursor
      const history = historyRef.current.slice(0, cursorRef.current + 1);
      history.push(snapshot);

      // Enforce max history size
      if (history.length > MAX_HISTORY) {
        history.shift();
      }

      historyRef.current = history;
      cursorRef.current = history.length - 1;
      bump();
    },
    [bump],
  );

  const undo = useCallback((): Snapshot | null => {
    if (cursorRef.current <= 0) return null;
    cursorRef.current -= 1;
    bump();
    return historyRef.current[cursorRef.current];
  }, [bump]);

  const redo = useCallback((): Snapshot | null => {
    if (cursorRef.current >= historyRef.current.length - 1) return null;
    cursorRef.current += 1;
    bump();
    return historyRef.current[cursorRef.current];
  }, [bump]);

  const canUndo = cursorRef.current > 0;
  const canRedo = cursorRef.current < historyRef.current.length - 1;

  return { canUndo, canRedo, pushSnapshot, undo, redo };
}
