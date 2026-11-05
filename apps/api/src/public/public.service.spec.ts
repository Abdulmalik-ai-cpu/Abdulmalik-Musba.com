import { describe, expect, it } from 'vitest';
import { PublicService } from './public.service';
import { PublishStatus, Visibility } from '@prisma/client';

/**
 * Public search must only ever surface content the owner published for the
 * public (§27, §143.26). We drive the real service against a recording stand-in
 * for Prisma so we can assert the exact filters it applies without needing a
 * live database.
 */
function recordingPrisma() {
  const calls: Array<{ model: string; where: unknown }> = [];
  const record = (model: string) => ({
    findMany: (args: { where?: unknown }) => {
      calls.push({ model, where: args?.where });
      return Promise.resolve([]);
    },
  });
  const prisma = {
    project: record('project'),
    article: record('article'),
    publication: record('publication'),
    research: record('research'),
    education: record('education'),
    experience: record('experience'),
    talk: record('talk'),
  };
  return { prisma, calls };
}

describe('PublicService.search', () => {
  it('returns nothing for a blank query without touching the database', async () => {
    const { prisma, calls } = recordingPrisma();
    const service = new PublicService(prisma as never);
    expect(await service.search('   ')).toEqual({ results: [], total: 0 });
    expect(calls).toHaveLength(0);
  });

  it('restricts every content type to PUBLIC visibility', async () => {
    const { prisma, calls } = recordingPrisma();
    const service = new PublicService(prisma as never);
    await service.search('research');

    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      const where = call.where as Record<string, unknown>;
      if (call.model === 'article') {
        // Articles additionally require the PUBLISHED status.
        expect(where.status).toBe(PublishStatus.PUBLISHED);
      }
      expect(where.visibility).toBe(Visibility.PUBLIC);
    }
  });

  it('never queries an article without the published gate', async () => {
    const { prisma, calls } = recordingPrisma();
    const service = new PublicService(prisma as never);
    await service.search('anything');
    const article = calls.find((call) => call.model === 'article');
    expect(article?.where).toMatchObject({ status: PublishStatus.PUBLISHED });
  });
});
