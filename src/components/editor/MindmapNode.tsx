'use client';

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import type { MindmapNodeData, MindmapNodeExtraProps } from '@/types/mindmap';
import NodeToolbar from './NodeToolbar';

const FONT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

function MindmapNode({
  id,
  data,
  selected,
  onExpand,
  expandingNodeId,
  onSendToChat,
}: NodeProps<Node<MindmapNodeData>> & MindmapNodeExtraProps) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  useEffect(() => {
    if (data.autoEditId === id) {
      const timer = setTimeout(() => {
        setIsEditing(true);
        updateNodeData(id, { autoEditId: undefined });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data.autoEditId, id, updateNodeData]);

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== data.label) {
      updateNodeData(id, { label: trimmed });
    } else {
      setEditValue(data.label);
    }
    setIsEditing(false);
  }, [editValue, data.label, id, updateNodeData]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        setEditValue(data.label);
        setIsEditing(false);
      }
    },
    [commitEdit, data.label],
  );

  const fontSizeClass = FONT_SIZE_CLASSES[data.fontSize ?? 'md'];
  const isExpanding = expandingNodeId === id;

  return (
    <>
      {selected && (
        <NodeToolbar
          nodeId={id}
          data={data}
          updateNodeData={updateNodeData}
          onSendToChat={onSendToChat}
          onExpand={onExpand}
          isExpanding={isExpanding}
        />
      )}
      <div
        onDoubleClick={handleDoubleClick}


        className={[
          'min-w-[120px] max-w-[240px] cursor-pointer rounded-xl px-4 py-2 shadow-md',
          'border-2 transition-colors relative',
          selected ? 'border-blue-500' : 'border-gray-200',
        ].join(' ')}
        style={{
          backgroundColor: data.bgColor || '#FFFFFF',
          color: data.textColor || '#1F2937',
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!border-0 !bg-blue-400"
        />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className={`nodrag w-full bg-transparent text-center font-medium outline-none ${fontSizeClass}`}
            style={{
              color: data.textColor || '#1F2937',
              fontWeight: data.bold ? 'bold' : undefined,
              fontStyle: data.italic ? 'italic' : undefined,
              minWidth: '80px',
            }}
          />
        ) : (
          <span
            className={`block text-center font-medium ${fontSizeClass} ${
              data.bold ? 'font-bold' : ''
            } ${data.italic ? 'italic' : ''}`}
          >
            {data.label}
          </span>
        )}

        {!isEditing && (
          <span className="block text-center text-[9px] text-gray-400 truncate mt-0.5 font-mono">
            {id}
          </span>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!border-0 !bg-blue-400"
        />
      </div>
    </>
  );
}

export default memo(MindmapNode);
