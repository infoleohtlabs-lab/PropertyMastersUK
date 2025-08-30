import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variants = {
      default: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 hover:border-gray-400 focus:ring-gray-500',
      primary: 'btn-primary',
      secondary: 'btn-secondary', 
      danger: 'btn-danger',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 hover:shadow-md',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 hover:shadow-md',
      outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-400 focus:ring-gray-500 hover:shadow-sm',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 focus:ring-gray-500',
      link: 'bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500 p-0 h-auto',
    };
    
    const sizes = {
      xs: 'h-7 px-2 py-1 text-xs rounded-md',
      sm: 'h-8 px-3 py-1.5 text-sm rounded-md',
      default: 'h-10 px-4 py-2.5 text-sm rounded-lg',
      lg: 'h-12 px-6 py-3 text-base rounded-lg',
      xl: 'h-14 px-8 py-4 text-lg rounded-xl',
      icon: 'h-10 w-10 p-0 rounded-lg',
    };
    
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className={cn(
          'flex-1 truncate',
          loading && 'opacity-70'
        )}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
export type { ButtonProps };