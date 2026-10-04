import type { ReactNode } from 'react';

const titleMarks: Record<string, string> = {
  'Provenance at a glance': '🏠',
  'Artifact registry': '📦',
  'Verify an artifact': '🛡️',
  'The full creation chain': '🌳',
  'Activity & audit trail': '📜',
  Models: '🧠',
  Artifacts: '📦',
  Verification: '🛡️',
  'Provenance explorer': '🌳',
  Testing: '🧪',
  'Model lifecycle': '🔄',
  'Version history': '📜',
  'Model trust at a glance': '🏠',
  'Model details': '🧠',
  'Artifact details': '📦',
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div className="page-head-copy">
        <div className="eyebrow">{eyebrow}</div>
        <div className="page-title-line"><span className="page-heading-icon" aria-hidden="true">{titleMarks[title] ?? '📄'}</span><h1>{title}</h1></div>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
