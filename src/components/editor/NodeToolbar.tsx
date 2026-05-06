'use client';

import { NodeToolbar as RFNodeToolbar, Position } from '@xyflow/react';
import ColorPicker from './ColorPicker';
import FontSizeSelector from './FontSizeSelector';
import type { MindmapNodeData } from '@/types/mindmap';

interface NodeToolbarProps {
  nodeId: string;
  data: MindmapNodeData;
  updateNodeData: (id: string, data: Partial<MindmapNodeData>) => void;
  onSendToChat?: (id: string) => void;
  onExpand?: (id: string) => void;
  isExpanding?: boolean;
}

export default function NodeToolbar({ nodeId, data, updateNodeData, onSendToChat, onExpand, isExpanding }: NodeToolbarProps) {
  return (
    <RFNodeToolbar nodeId={nodeId} position={Position.Top} offset={12} align="center">
      <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2 shadow-md">
        <ColorPicker
          value={data.bgColor}
          onChange={(color) => updateNodeData(nodeId, { bgColor: color })}
          label="Background color"
        />
        <ColorPicker
          value={data.textColor}
          onChange={(color) => updateNodeData(nodeId, { textColor: color })}
          label="Text color"
        />

        <div className="h-6 w-px bg-gray-200" />

        <FontSizeSelector
          value={data.fontSize}
          onChange={(size) => updateNodeData(nodeId, { fontSize: size })}
        />

        <div className="h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => updateNodeData(nodeId, { bold: !data.bold })}
          className={`rounded px-2 py-1 text-xs font-bold transition-colors ${
            data.bold ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => updateNodeData(nodeId, { italic: !data.italic })}
          className={`rounded px-2 py-1 text-xs italic transition-colors ${
            data.italic ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          I
        </button>

        <div className="h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => onSendToChat?.(nodeId)}
          className="rounded-full bg-green-500 px-2.5 py-1 text-[10px] leading-none text-white shadow hover:bg-green-600 transition-colors whitespace-nowrap"
        >
          Send to chat
        </button>

        <button
          type="button"
          onClick={() => onExpand?.(nodeId)}
          disabled={isExpanding}
          className={`rounded-full px-2.5 py-1 text-[10px] leading-none text-white shadow transition-colors whitespace-nowrap ${
            isExpanding
              ? 'bg-purple-400 cursor-wait'
              : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {isExpanding ? '...' : 'Expand'}
        </button>
      </div>
    </RFNodeToolbar>
  );
}
