import { nanoid } from 'nanoid';
import { MindmapRepository } from './repository';
import type { Mindmap } from '@/types/mindmap';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const ShareService = {
  async generateShareLink(mindmapId: string): Promise<string> {
    const slug = nanoid(10);
    await MindmapRepository.setPublic(mindmapId, true, slug);
    return `${APP_URL}/share/${slug}`;
  },

  async revokeShareLink(mindmapId: string): Promise<void> {
    await MindmapRepository.setPublic(mindmapId, false, null);
  },

  async findBySlug(slug: string): Promise<Mindmap | null> {
    return MindmapRepository.findBySlug(slug);
  },
};
