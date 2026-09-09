import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'green' | 'pink' | 'yellow' | 'gray' | 'blue';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-700',
    pink: 'bg-pink-100 text-pink-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}