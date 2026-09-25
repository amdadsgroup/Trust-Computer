import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-brand-600 text-white shadow hover:bg-brand-700',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        destructive:
          'border-transparent bg-accent-500 text-white shadow hover:bg-accent-600',
        accent:
          'border-transparent bg-accent-50 text-accent-700 border-accent-200 font-bold',
        outline:
          'text-slate-700 border-slate-200',
        success:
          'border-transparent bg-emerald-50 text-emerald-700 border-emerald-200',
        warning:
          'border-transparent bg-amber-50 text-amber-700 border-amber-200',
        info:
          'border-transparent bg-blue-50 text-blue-700 border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
