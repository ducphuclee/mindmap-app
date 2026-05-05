import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js before importing repository
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// Mock the server client (used by other methods, not findBySlug)
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { MindmapRepository } from './repository';

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

function buildChain() {
  mockSingle.mockReturnValue({ data: null, error: null });
  mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ select: mockSelect });
  vi.mocked(createClient).mockReturnValue({ from: mockFrom } as ReturnType<typeof createClient>);
}

beforeEach(() => {
  vi.clearAllMocks();
  buildChain();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

describe('MindmapRepository.findBySlug', () => {
  it('returns null when Supabase throws a network-level error (fetch failed)', async () => {
    // Simulate fetch failing at the network level (not a Supabase error object)
    mockSingle.mockRejectedValue(new TypeError('fetch failed'));

    const result = await MindmapRepository.findBySlug('some-slug');

    expect(result).toBeNull();
  });

  it('returns null when Supabase returns a non-PGRST116 error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation does not exist' },
    });

    const result = await MindmapRepository.findBySlug('some-slug');

    expect(result).toBeNull();
  });

  it('returns null when Supabase returns PGRST116 (not found)', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    const result = await MindmapRepository.findBySlug('some-slug');

    expect(result).toBeNull();
  });

  it('returns mindmap data when found successfully', async () => {
    const row = {
      id: 'uuid-1',
      user_id: 'user-1',
      title: 'My Mindmap',
      data: { nodes: [], edges: [], layoutType: 'radial' },
      is_public: true,
      slug: 'my-mindmap',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    mockSingle.mockResolvedValue({ data: row, error: null });

    const result = await MindmapRepository.findBySlug('my-mindmap');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('uuid-1');
    expect(result?.title).toBe('My Mindmap');
    expect(result?.slug).toBe('my-mindmap');
  });
});
