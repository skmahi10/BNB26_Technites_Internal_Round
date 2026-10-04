'use client';

import { useParams } from 'next/navigation';
import { ArtifactDetailPage } from '@/components/features/DetailPages';

export default function Page() {
  const params = useParams<{ artifactId: string }>();
  return <ArtifactDetailPage artifactId={decodeURIComponent(params.artifactId)} />;
}
