import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
        accent: 'bg-accent-600 text-white hover:bg-accent-700',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
        link: 'underline-offset-4 hover:underline text-primary-600 bg-transparent',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 rounded-md',
        lg: 'h-12 px-8 rounded-md',
        icon: 'h-10 w-10 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };