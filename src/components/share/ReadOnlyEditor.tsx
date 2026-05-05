'use client';

import { ReactFlow, MiniMap, Controls, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { MindmapNode, MindmapEdge, MindmapNodeData } from '@/types/mindmap';

type FlowNode = Node<MindmapNodeData>;

interface ReadOnlyEditorProps {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export default function ReadOnlyEditor({ nodes, edges }: ReadOnlyEditorProps) {
  const flowNodes: FlowNode[] = nodes.map((n) => ({
    id: n.id,
    type: n.type ?? 'default',
    position: n.position,
    data: n.data,
  }));

  const flowEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type ?? 'smoothstep',
  }));

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap position="bottom-right" />
        <Controls position="bottom-left" />
        <Background />
      </ReactFlow>
    </div>
  );
}
