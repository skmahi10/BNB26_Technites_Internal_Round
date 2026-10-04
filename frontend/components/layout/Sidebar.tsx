'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icons';

type NavItem = { href: string; label: string; icon: IconName };

const primaryLinks: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'home' },
  { href: '/artifacts', label: 'Artifacts', icon: 'box' },
  { href: '/verification', label: 'Verify', icon: 'shield' },
  { href: '/provenance', label: 'Provenance', icon: 'network' },
  { href: '/activity', label: 'Activity', icon: 'activity' },
];

const additionalLinks: NavItem[] = [
  { href: '/models', label: 'Models', icon: 'cube' },
  { href: '/testing', label: 'Testing', icon: 'flask' },
  { href: '/lifecycle', label: 'Lifecycle', icon: 'arrows' },
  { href: '/history', label: 'History', icon: 'clock' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const additionalIsActive = additionalLinks.some((item) => isActive(pathname, item.href));

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="ModelLedger dashboard">
        <span className="brand-mark"><Icon name="shield" size={18} /></span>
        <span className="brand-name">MODEL<span>LEDGER</span></span>
      </Link>

      <div className="nav-group-label">Workspace</div>
      <nav className="nav-list" aria-label="Workspace">
        {primaryLinks.map((item) => {
          const active = isActive(pathname, item.href);
          return <Link key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon name={item.icon} size={16} /><span className="nav-label">{item.label}</span>
          </Link>;
        })}
      </nav>

      <details className="sidebar-more" open={additionalIsActive}>
        <summary><Icon name="dots" size={15} /><span>More views</span><Icon name="chevron" size={12} /></summary>
        <nav className="nav-list" aria-label="Additional workspace views">
          {additionalLinks.map((item) => {
            const active = isActive(pathname, item.href);
            return <Link key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon name={item.icon} size={16} /><span className="nav-label">{item.label}</span>
            </Link>;
          })}
        </nav>
      </details>

      <div className="sidebar-spacer" />
      <button className="workspace-switch" type="button" disabled title="Workspace identity is supplied by the application configuration">
        <span className="workspace-avatar">W</span>
        <span className="workspace-meta"><strong>Workspace</strong><small>Account not configured</small></span>
        <Icon name="arrowDown" size={13} />
      </button>
      <button className="help-action" type="button" disabled title="Documentation link is not configured">
        <Icon name="info" size={14} /><span>Help &amp; documentation</span>
      </button>
      <div className="sidebar-user" aria-label="Signed-in profile not configured">
        <span className="user-avatar">?</span>
        <span className="user-meta"><strong>Profile</strong><small>Not configured</small></span>
        <Icon name="dots" size={15} />
      </div>
    </aside>
  );
}
