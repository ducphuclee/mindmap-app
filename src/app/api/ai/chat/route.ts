import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, context } = await req.json();

  const encoder = new TextEncoder();

  const mentionRegex = /@([\w\s]+?)(?=\s@|\s|$)/g;
  const mentionedLabels = new Set<string>();
  let match;
  while ((match = mentionRegex.exec(message)) !== null) {
    mentionedLabels.add(match[1].trim());
  }
  const mentionedNodes = (context.nodes ?? []).filter((n: any) =>
    mentionedLabels.has(n.data.label),
  );
  let mentionContext = '';
  if (mentionedNodes.length > 0) {
    mentionContext = `\nThe user mentioned these specific nodes in their message:\n${JSON.stringify(
      mentionedNodes.map((n: any) => ({ id: n.id, label: n.data.label, parentId: n.parentId })),
    )}\n`;
  }

  const systemPrompt = `You are an AI assistant for a mindmap application. The current mindmap has these nodes and edges:${mentionContext}

Nodes:
${JSON.stringify(context.nodes.map((n: any) => ({ id: n.id, label: n.data.label, parentId: n.parentId })))}

Edges:
${JSON.stringify(context.edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target })))}

You can respond to the user's request and optionally include a diff to modify the mindmap.

To include a diff, wrap it in these markers:
<mindmap_diff>
{"ops": [{"type": "add_node", "id": "...", "position": {"x": 0, "y": 0}, "data": {"label": "..."}}, ...]}
</mindmap_diff>

Supported operations:
- add_node: { "type": "add_node", "id": string, "position": {"x": number, "y": number}, "data": {"label": string}, "parentId"?: string }
- rename_node: { "type": "rename_node", "nodeId": string, "label": string }
- delete_node: { "type": "delete_node", "nodeId": string }
- add_edge: { "type": "add_edge", "id": string, "source": string, "target": string, "label"?: string }
- delete_edge: { "type": "delete_edge", "edgeId": string }

Generate meaningful node IDs like "node-brainstorming" or "node-research".`;

  const stream = new ReadableStream({
    async start(controller) {
      const { OpenAI } = await import('openai');

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });

      let fullText = '';

      try {
        const openaiStream = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          stream: true,
          temperature: 0.5,
          max_tokens: 1000,
        });

        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', content })}\n\n`,
              ),
            );
          }
        }

        const diff = parseDiffFromText(fullText);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'done', diff })}\n\n`,
          ),
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

const DIFF_MARKER_START = '<mindmap_diff>';
const DIFF_MARKER_END = '</mindmap_diff>';

interface DiffOp {
  type: string;
  [key: string]: unknown;
}

function parseDiffFromText(fullText: string): { ops: DiffOp[] } {
  const startIdx = fullText.indexOf(DIFF_MARKER_START);
  const endIdx = fullText.indexOf(DIFF_MARKER_END);

  if (startIdx === -1 || endIdx === -1) {
    return { ops: [] };
  }

  const jsonStr = fullText.slice(
    startIdx + DIFF_MARKER_START.length,
    endIdx,
  ).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return { ops: Array.isArray(parsed.ops) ? parsed.ops : [] };
  } catch {
    return { ops: [] };
  }
}
