import { ModelsPage } from '@/components/features/ResourcePages';

export default async function Page({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams;
  return <ModelsPage initialSearch={params.search ?? ''} />;
}
