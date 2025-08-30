import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"
import { X } from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-all duration-300 ease-in-out transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95 cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg focus:ring-primary-500",
        secondary:
          "border-transparent bg-secondary-100 text-secondary-800 hover:bg-secondary-200 hover:shadow-md focus:ring-secondary-500",
        success:
          "border-transparent bg-success-100 text-success-800 hover:bg-success-200 hover:shadow-md hover:text-success-900 focus:ring-success-500",
        warning:
          "border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200 hover:shadow-md hover:text-warning-900 focus:ring-warning-500",
        danger:
          "border-transparent bg-danger-100 text-danger-800 hover:bg-danger-200 hover:shadow-md hover:text-danger-900 focus:ring-danger-500",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 hover:shadow-md hover:text-blue-900 focus:ring-blue-500",
        outline:
          "border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 hover:shadow-sm focus:ring-secondary-500",
        ghost:
          "border-transparent bg-transparent text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800 hover:shadow-sm focus:ring-secondary-500",
        // Priority variants
        "priority-low":
          "border-transparent bg-priority-low-100 text-priority-low-800 hover:bg-priority-low-200 hover:shadow-md hover:text-priority-low-900",
        "priority-medium":
          "border-transparent bg-priority-medium-100 text-priority-medium-800 hover:bg-priority-medium-200 hover:shadow-md hover:text-priority-medium-900",
        "priority-high":
          "border-transparent bg-priority-high-100 text-priority-high-800 hover:bg-priority-high-200 hover:shadow-md hover:text-priority-high-900",
        "priority-urgent":
          "border-transparent bg-priority-urgent-100 text-priority-urgent-800 hover:bg-priority-urgent-200 hover:shadow-lg hover:text-priority-urgent-900 animate-pulse",
      },
      size: {
        xs: "px-2 py-0.5 text-xs",
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-sm",
        xl: "px-5 py-2 text-base",
      },
      shape: {
        rounded: "rounded-full",
        square: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      shape: "rounded",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  dot?: boolean;
}

function Badge({ 
  className, 
  variant, 
  size, 
  shape, 
  dismissible = false, 
  onDismiss, 
  icon, 
  dot = false, 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size, shape }), "group", className)} 
      {...props}
    >
      {dot && (
        <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 transition-all duration-300 group-hover:scale-125" />
      )}
      {icon && (
        <div className="mr-1.5 -ml-0.5 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      )}
      {children}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1.5 -mr-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/20 focus:outline-none focus:bg-black/20 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Remove badge"
        >
          <X className="w-3 h-3 transition-transform duration-200 hover:rotate-90" />
        </button>
      )}
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft';
}

function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusVariants = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    draft: 'secondary'
  } as const;

  return (
    <Badge 
      variant={statusVariants[status]} 
      dot
      {...props}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Priority Badge Component
interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

function PriorityBadge({ priority, ...props }: PriorityBadgeProps) {
  const priorityVariant = `priority-${priority}` as const;
  
  return (
    <Badge 
      variant={priorityVariant}
      {...props}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

export { Badge, StatusBadge, PriorityBadge, badgeVariants }
export type { BadgeProps, StatusBadgeProps, PriorityBadgeProps }