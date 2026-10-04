import type { ReactNode } from 'react';

export interface CardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return <section className={`panel ${className}`}>
    <div className="panel-header"><div className="panel-heading"><h2 className="panel-title">{title}</h2>{subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}</div>{action}</div>
    {children}
  </section>;
}

export const Panel = Card;
