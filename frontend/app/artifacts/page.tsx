import { ArtifactsPage } from '@/components/features/ResourcePages';

export default async function Page({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams;
  return <ArtifactsPage initialSearch={params.search ?? ''} />;
}
