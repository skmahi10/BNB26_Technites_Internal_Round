import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  size?: 'default' | 'sm';
  icon?: ReactNode;
}

export function Button({ variant = 'secondary', size = 'default', icon, className, children, ...props }: ButtonProps) {
  return <button className={cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', className)} {...props}>{icon}{children}</button>;
}
