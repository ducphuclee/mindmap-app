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
      <div className="flex items-center gap-2 rounded-[12px] border border-[rgba(214,235,253,0.19)] bg-black px-3 py-2 shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]">
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

        <div className="h-6 w-px bg-[rgba(214,235,253,0.19)]" />

        <FontSizeSelector
          value={data.fontSize}
          onChange={(size) => updateNodeData(nodeId, { fontSize: size })}
        />

        <div className="h-6 w-px bg-[rgba(214,235,253,0.19)]" />

        <button
          type="button"
          onClick={() => updateNodeData(nodeId, { bold: !data.bold })}
          className={`rounded px-2 py-1 text-xs font-bold transition-colors ${
            data.bold ? 'bg-[rgba(255,255,255,0.1)] text-[#f0f0f0]' : 'text-[#a1a4a5] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0f0f0]'
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => updateNodeData(nodeId, { italic: !data.italic })}
          className={`rounded px-2 py-1 text-xs italic transition-colors ${
            data.italic ? 'bg-[rgba(255,255,255,0.1)] text-[#f0f0f0]' : 'text-[#a1a4a5] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0f0f0]'
          }`}
        >
          I
        </button>
      </div>
    </RFNodeToolbar>
  );
}
