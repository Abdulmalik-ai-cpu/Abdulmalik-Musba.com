'use client';

import { useEffect, useState } from 'react';
import { EntityManager } from '@/components/entity-manager';

export default function EntityPage({ params }: { params: Promise<{ entity: string }> }) {
  const [entity, setEntity] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ entity: value }) => setEntity(value));
  }, [params]);

  if (!entity) {
    return <div className="h-40 animate-pulse rounded-2xl bg-ink/5" />;
  }

  return <EntityManager entity={entity} />;
}