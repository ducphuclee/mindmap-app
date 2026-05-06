import type { MindmapData, MindmapNode, MindmapEdge } from '@/types/mindmap';
import type { MindmapDiff } from '@/types/ai';
import { getOpenAIClient } from './openai-client';

/**
 * Extract JSON from model response regardless of whether the model wraps
 * it in markdown code fences or returns it raw. This is necessary because
 * some custom models (e.g. docgen) do not reliably follow "return ONLY JSON"
 * instructions and may wrap the output in ```json ... ``` blocks.
 */
function extractJSON(text: string): string {
  // Try ```json ... ``` or ``` ... ``` code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  // Try to find a raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text.trim();
}

const SYSTEM_PROMPT = `You are a mindmap generator. Given a topic or text, produce a JSON object representing a mindmap.

IMPORTANT: You MUST respond with ONLY valid JSON. No explanations, no code, no markdown fences.
Your entire response must be parseable by JSON.parse().

The JSON must match this schema:
{
  "nodes": [
    { "id": "root", "position": { "x": 0, "y": 0 }, "data": { "label": "Central Topic" } },
    { "id": "child1", "position": { "x": 0, "y": 0 }, "data": { "label": "Subtopic 1" }, "parentId": "root" },
    { "id": "child2", "position": { "x": 0, "y": 0 }, "data": { "label": "Subtopic 2" }, "parentId": "root" }
  ],
  "edges": [
    { "id": "e-root-child1", "source": "root", "target": "child1" },
    { "id": "e-root-child2", "source": "root", "target": "child2" }
  ]
}

Rules:
- Each node must have a unique string id.
- Each node must have "position": { "x": 0, "y": 0 } (position will be auto-laid out later).
- Each node must have "data.label" with the display text.
- Connect nodes with edges using source and target ids.
- Return ONLY valid JSON with no additional text or markdown.`;

export async function generateFromText(text: string): Promise<MindmapData> {
  const client = getOpenAIClient();
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o',
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(extractJSON(content));

      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid response: nodes array is required');
      }

      const seenCount = new Map<string, number>();
      const dedupedNodes: MindmapNode[] = [];
      const idMap = new Map<string, string>();

      for (const node of parsed.nodes as MindmapNode[]) {
        const origId = node.id;
        const count = seenCount.get(origId) ?? 0;
        if (count === 0) {
          seenCount.set(origId, 1);
          idMap.set(origId, origId);
          dedupedNodes.push(node);
        } else {
          const newId = `${origId}_${count}`;
          seenCount.set(origId, count + 1);
          idMap.set(origId, newId);
          dedupedNodes.push({ ...node, id: newId });
        }
      }

      const dedupedEdges = (parsed.edges ?? []).map((e: MindmapEdge) => ({
        ...e,
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }));

      return { nodes: dedupedNodes, edges: dedupedEdges as MindmapEdge[] };
    } catch (err) {
      lastError = err;
      console.warn(
        `generateFromText attempt ${attempt} failed:`,
        err instanceof Error ? err.message.slice(0, 200) : err,
      );
    }
  }

  throw new Error(
    `AI model failed to return valid JSON after ${maxAttempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export async function expandNode(
  nodeId: string,
  nodeLabel: string,
  context: MindmapData,
): Promise<MindmapDiff> {
  const client = getOpenAIClient();

  const prompt = `You are a mindmap expansion assistant. Given a node labeled "${nodeLabel}" in an existing mindmap, suggest 3-5 related child concepts that branch naturally from it.

IMPORTANT: You MUST respond with ONLY valid JSON. No explanations, no code, no markdown fences.
Your entire response must be parseable by JSON.parse().

Return a JSON object with this exact structure:
{
  "ops": [
    { "type": "add_node", "id": "ai-1", "position": { "x": 0, "y": 0 }, "data": { "label": "<child>" }, "parentId": "${nodeId}" },
    { "type": "add_edge", "id": "edge-${nodeId}-ai-1", "source": "${nodeId}", "target": "ai-1" }
  ]
}

Existing mindmap context:
${JSON.stringify(context, null, 2)}

Rules:
- Generate 3-5 child nodes
- Each child must have a matching add_edge op
- Use sequential IDs: ai-1, ai-2, etc.
- Offset child positions from parent — fan out horizontally and vertically
- Return ONLY valid JSON. No markdown, no explanations.`;

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o',
        temperature: 0.7,
        messages: [
          { role: 'system', content: prompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(extractJSON(content)) as MindmapDiff;

      if (!parsed.ops || !Array.isArray(parsed.ops)) {
        throw new Error('Invalid response format from OpenAI');
      }

      // Post-process: remap AI-generated node IDs to globally unique IDs
      // to prevent duplicate key collisions when expanding the same node twice
      const idMap = new Map<string, string>();
      for (const op of parsed.ops) {
        if (op.type === 'add_node') {
          const orig = op.id;
          const unique = `${orig}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          idMap.set(orig, unique);
          op.id = unique;
        }
      }
      // Remap edge source/target and edge IDs that reference remapped node IDs
      for (const op of parsed.ops) {
        if (op.type === 'add_edge') {
          if (idMap.has(op.source)) op.source = idMap.get(op.source)!;
          if (idMap.has(op.target)) op.target = idMap.get(op.target)!;
          for (const [orig, unique] of idMap) {
            if (op.id.includes(orig)) {
              op.id = op.id.replace(orig, unique);
            }
          }
        }
      }

      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(
        `expandNode attempt ${attempt} failed:`,
        err instanceof Error ? err.message.slice(0, 200) : err,
      );
    }
  }

  throw new Error(
    `AI model failed to return valid JSON after ${maxAttempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export async function chatCommand(
  message: string,
  mentions: MindmapNode[],
  context: MindmapData,
): Promise<{ text: string; diff: MindmapDiff }> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let diff: MindmapDiff = { ops: [] };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr) continue;

      try {
        const data = JSON.parse(dataStr);
        if (data.type === 'text') {
          fullText += data.content;
        } else if (data.type === 'done') {
          diff = data.diff ?? { ops: [] };
        }
      } catch {
        // skip malformed
      }
    }
  }

  return { text: fullText, diff };
}
