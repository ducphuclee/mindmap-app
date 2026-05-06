import type { CSSProperties } from 'react';

// React Flow compatible type definitions
// These match the @xyflow/react Node and Edge interfaces
// without requiring the package to be installed at this stage.

export interface MindmapNodeData extends Record<string, unknown> {
  label: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  bold?: boolean;
  italic?: boolean;
  autoEditId?: string;
}

// Mirrors React Flow's Node<T> interface
export interface MindmapNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: MindmapNodeData;
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
  parentId?: string;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
}

// Mirrors React Flow's Edge interface
export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  style?: CSSProperties;
  className?: string;
  selected?: boolean;
  data?: Record<string, unknown>;
}

export interface MindmapData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  layoutType?: 'radial' | 'tree-td' | 'tree-lr';
}

export interface MindmapNodeExtraProps {
  onExpand?: (nodeId: string) => void;
  expandingNodeId?: string;
  onSendToChat?: (nodeId: string) => void;
}

export interface Mindmap {
  id: string;
  user_id: string;
  title: string;
  data: MindmapData;
  is_public: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}
