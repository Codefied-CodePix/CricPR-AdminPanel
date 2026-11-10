import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white shadow-primary/20',
        secondary: 'border-transparent bg-secondary text-white shadow-secondary/20',
        destructive: 'border-transparent bg-red text-white shadow-red/20',
        outline: 'text-foreground border-2',
        success: 'border-transparent bg-green-500 text-white shadow-green-500/20',
        warning: 'border-transparent bg-yellow-500 text-white shadow-yellow-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }

