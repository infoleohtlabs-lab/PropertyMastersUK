import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', interactive = false, loading = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-300 ease-in-out transform-gpu';
    
    const variants = {
      default: 'bg-white border border-secondary-200 shadow-sm hover:shadow-lg hover:shadow-secondary-500/10 hover:border-secondary-300 hover:-translate-y-1',
      outlined: 'bg-white border-2 border-secondary-300 hover:border-primary-400 hover:shadow-md hover:shadow-primary-500/10 hover:-translate-y-1',
      elevated: 'bg-white shadow-lg hover:shadow-2xl hover:shadow-secondary-500/20 border-0 hover:-translate-y-2',
      ghost: 'bg-transparent border-0 hover:bg-secondary-50 hover:shadow-sm hover:shadow-secondary-500/5',
      gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 shadow-sm hover:shadow-lg hover:shadow-primary-500/15 hover:from-primary-100 hover:to-secondary-100 hover:-translate-y-1',
    };
    
    const sizes = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const interactiveClasses = interactive 
      ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group transition-transform duration-300'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          interactiveClasses,
          loading && 'animate-pulse',
          className
        )}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded animate-shimmer" />
            <div className="h-4 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded animate-shimmer w-3/4" />
            <div className="h-4 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded animate-shimmer w-1/2" />
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            {children}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { divider?: boolean }
>(({ className, divider = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 pb-4 transition-all duration-200',
      divider && 'border-b border-secondary-200 mb-4 group-hover:border-secondary-300',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
  };
  
  return (
    <h3
      ref={ref}
      className={cn(
        'text-secondary-900 leading-tight tracking-tight transition-colors duration-200 group-hover:text-primary-700',
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-secondary-600 leading-relaxed transition-colors duration-200 group-hover:text-secondary-700', className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding = false, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      'flex-1',
      !noPadding && 'py-2',
      className
    )} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { divider?: boolean; justify?: 'start' | 'center' | 'end' | 'between' }
>(({ className, divider = false, justify = 'start', ...props }, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 pt-4 transition-all duration-200',
        divider && 'border-t border-secondary-200 mt-4 group-hover:border-secondary-300',
        justifyClasses[justify],
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

// Additional Card Components
const CardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-secondary-100 text-secondary-700 group-hover:bg-secondary-200 group-hover:text-secondary-800',
    success: 'bg-success-100 text-success-700 group-hover:bg-success-200 group-hover:text-success-800',
    warning: 'bg-warning-100 text-warning-700 group-hover:bg-warning-200 group-hover:text-warning-800',
    danger: 'bg-danger-100 text-danger-700 group-hover:bg-danger-200 group-hover:text-danger-800',
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 transform group-hover:scale-105',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
CardBadge.displayName = "CardBadge";

const CardStats = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    value: string | number;
    label: string;
    trend?: { value: number; isPositive: boolean };
    icon?: React.ReactNode;
  }
>(({ className, value, label, trend, icon, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between transition-all duration-200', className)}
    {...props}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg transition-all duration-200 group-hover:bg-primary-200 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
      )}
      <div className="transition-all duration-200">
        <p className="text-2xl font-bold text-secondary-900 group-hover:text-primary-700 transition-colors duration-200">{value}</p>
        <p className="text-sm text-secondary-600 group-hover:text-secondary-700 transition-colors duration-200">{label}</p>
      </div>
    </div>
    {trend && (
      <div className={cn(
        'flex items-center gap-1 text-sm font-medium transition-all duration-200 group-hover:scale-110',
        trend.isPositive ? 'text-success-600 group-hover:text-success-700' : 'text-danger-600 group-hover:text-danger-700'
      )}>
        <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d={trend.isPositive 
              ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            }
            clipRule="evenodd"
          />
        </svg>
        {Math.abs(trend.value)}%
      </div>
    )}
  </div>
));
CardStats.displayName = "CardStats";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardBadge, 
  CardStats 
};