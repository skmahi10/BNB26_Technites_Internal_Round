'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icons';

function pageLabel(pathname: string): string {
  if (pathname.includes('/models/')) return 'Model details';
  if (pathname.includes('/artifacts/')) return 'Artifact details';
  const labels: Record<string, string> = {
    '/': 'Dashboard', '/models': 'Models', '/artifacts': 'Artifacts', '/verification': 'Verify',
    '/provenance': 'Provenance', '/testing': 'Testing', '/lifecycle': 'Lifecycle',
    '/history': 'History', '/activity': 'Activity',
  };
  return labels[pathname] ?? 'Workspace';
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('workspaceSearch')?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    const target = pathname.startsWith('/models') ? '/models' : '/artifacts';
    router.push(`${target}?search=${encodeURIComponent(value)}`);
  }

  return <header className="topbar">
    <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={12} /><span className="breadcrumb-current">{pageLabel(pathname)}</span></div>
    <div className="topbar-actions">
      <form className="search-box" role="search" onSubmit={submitSearch}>
        <Icon name="search" size={15} />
        <input id="workspaceSearch" className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search artifacts, models…" aria-label="Search artifacts and models" />
        <span className="search-shortcut" aria-hidden="true">⌘ K</span>
      </form>
      <button className="topbar-icon" type="button" disabled aria-label="Notifications are not configured" title="Notifications are not configured"><Icon name="bell" size={16} /></button>
      <button className="profile-chip" type="button" disabled aria-label="Profile is not configured" title="Profile is not configured"><span>?</span><Icon name="arrowDown" size={11} /></button>
    </div>
  </header>;
}
