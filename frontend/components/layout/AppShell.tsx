import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell"><Sidebar /><div className="main-shell"><Topbar /><main className="main-content">{children}</main></div></div>;
}
