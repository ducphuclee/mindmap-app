'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import type { MindmapNodeData } from '@/types/mindmap';
import NodeToolbar from './NodeToolbar';

const FONT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

interface MindmapNodeExtraProps {
  onExpand?: (nodeId: string) => void;
  expandingNodeId?: string;
  onSendToChat?: (nodeLabel: string) => void;
}

export default function MindmapNode({
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
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (data.autoEditId === id) {
      requestAnimationFrame(() => {
        setIsEditing(true);
      });
    }
  }, [data.autoEditId, id]);

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
        <NodeToolbar nodeId={id} data={data} updateNodeData={updateNodeData} />
      )}
      <div
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

        {isHovered && !isEditing && (
          <div className="nodrag absolute -top-4 right-0 flex gap-0.5">
            <button
              onClick={() => onSendToChat?.(data.label)}
              className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] leading-none text-white shadow hover:bg-green-600 transition-colors whitespace-nowrap"
            >
              Send to chat
            </button>
            <button
              onClick={() => onExpand?.(id)}
              className={`rounded-full bg-purple-500 px-1.5 py-0.5 text-[10px] leading-none text-white shadow hover:bg-purple-600 transition-colors whitespace-nowrap ${isExpanding ? 'opacity-50 cursor-wait' : ''}`}
              disabled={isExpanding}
            >
              {isExpanding ? '...' : 'Expand'}
            </button>
          </div>
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
