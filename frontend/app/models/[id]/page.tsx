'use client';

import { useParams } from 'next/navigation';
import { ModelDetailPage } from '@/components/features/DetailPages';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <ModelDetailPage modelId={decodeURIComponent(params.id)} />;
}
