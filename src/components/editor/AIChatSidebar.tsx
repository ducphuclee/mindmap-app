'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { MindmapData } from '@/types/mindmap';
import type { MindmapDiff } from '@/types/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

interface AIChatSidebarProps {
  context: MindmapData;
  onApplyDiff: (diff: MindmapDiff) => void;
  prefillInput?: string;
  onPrefillConsumed: () => void;
  nodes: Array<{id: string; data: {label: string}}>;
}

export default function AIChatSidebar({ context, onApplyDiff, prefillInput, onPrefillConsumed, nodes }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillInput) {
      setInput(prefillInput);
      onPrefillConsumed();
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [prefillInput, onPrefillConsumed]);

  const filteredMentions = showMentions
    ? nodes.filter((n) =>
        n.data.label.toLowerCase().includes(mentionFilter.toLowerCase()),
      )
    : [];

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setShowMentions(false);
    setIsLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.content,
                  };
                }
                return updated;
              });
              scrollToBottom();
            } else if (data.type === 'done') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    isStreaming: false,
                  };
                }
                return updated;
              });
              if (data.diff && data.diff.ops && data.diff.ops.length > 0) {
                onApplyDiff(data.diff);
              }
            } else if (data.type === 'error') {
              throw new Error(data.content);
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            content: 'Something went wrong. Please try again.',
            isStreaming: false,
            isError: true,
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, context, onApplyDiff, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape' && showMentions) {
        setShowMentions(false);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, showMentions],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      const atIndex = value.lastIndexOf('@');
      if (atIndex !== -1) {
        const afterAt = value.slice(atIndex + 1);
        const hasSpace = afterAt.includes(' ');
        if (!hasSpace) {
          setShowMentions(true);
          setMentionFilter(afterAt);
          return;
        }
      }
      setShowMentions(false);
    },
    [],
  );

  const handleMentionClick = useCallback(
    (label: string) => {
      const atIndex = input.lastIndexOf('@');
      const beforeAt = input.slice(0, atIndex);
      const afterAt = input.slice(atIndex + 1);
      const rest = afterAt.slice(mentionFilter.length);
      setInput(`${beforeAt}@${label} ${rest}`);
      setShowMentions(false);
      textareaRef.current?.focus();
    },
    [input, mentionFilter],
  );

  useEffect(() => {
    if (!showMentions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentions]);

  return (
    <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">AI Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Ask AI to modify your mindmap
          </p>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                data-testid={msg.role === 'assistant' ? 'ai-message' : 'user-message'}
                className={`max-w-[85%] rounded-[12px] px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#3b9eff] text-white'
                    : msg.isError
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.isStreaming && !msg.content ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.3s]" />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex gap-2 relative">
          {showMentions && filteredMentions.length > 0 && (
            <div
              ref={mentionRef}
              className="absolute bottom-full left-0 right-0 mb-1 max-h-32 overflow-y-auto rounded-[12px] border border-gray-200 bg-white shadow-md z-10"
            >
              {filteredMentions.map((n) => (
                <button
                  key={n.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMentionClick(n.data.label);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  @{n.data.label}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to modify... (type @ to mention a node)"
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#3b9eff] focus:ring-1 focus:ring-[#3b9eff] disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="self-end rounded-[9999px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
