'use client';

import { NodeToolbar as RFNodeToolbar, Position } from '@xyflow/react';
import ColorPicker from './ColorPicker';
import FontSizeSelector from './FontSizeSelector';
import type { MindmapNodeData } from '@/types/mindmap';

interface NodeToolbarProps {
  nodeId: string;
  data: MindmapNodeData;
  updateNodeData: (id: string, data: Partial<MindmapNodeData>) => void;
}

export default function NodeToolbar({ nodeId, data, updateNodeData }: NodeToolbarProps) {
  return (
    <RFNodeToolbar nodeId={nodeId} position={Position.Top} offset={12} align="center">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
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
            data.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => updateNodeData(nodeId, { italic: !data.italic })}
          className={`rounded px-2 py-1 text-xs italic transition-colors ${
            data.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          I
        </button>
      </div>
    </RFNodeToolbar>
  );
}
