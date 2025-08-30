import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const baseClasses = 'group inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transform hover:scale-105 active:scale-95 focus:scale-105';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-sm hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-300',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 active:bg-secondary-300 text-secondary-700 focus:ring-secondary-500 border border-secondary-200 hover:border-secondary-300 hover:shadow-md transition-shadow duration-300',
    outline: 'border border-secondary-300 bg-white hover:bg-secondary-50 active:bg-secondary-100 text-secondary-700 focus:ring-primary-500 hover:border-primary-400 hover:text-primary-700 hover:shadow-md transition-all duration-300',
    ghost: 'hover:bg-secondary-100 active:bg-secondary-200 text-secondary-700 focus:ring-secondary-500 hover:text-primary-700 transition-colors duration-200',
    danger: 'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white focus:ring-danger-500 shadow-sm hover:shadow-lg hover:shadow-danger-500/25 transition-shadow duration-300',
    success: 'bg-success-600 hover:bg-success-700 active:bg-success-800 text-white focus:ring-success-500 shadow-sm hover:shadow-lg hover:shadow-success-500/25 transition-shadow duration-300',
    warning: 'bg-warning-600 hover:bg-warning-700 active:bg-warning-800 text-white focus:ring-warning-500 shadow-sm hover:shadow-lg hover:shadow-warning-500/25 transition-shadow duration-300',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14',
  };
  
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        isDisabled && 'cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-75" />
        </div>
      )}
      
      <div className={cn('flex items-center gap-2 transition-opacity duration-200', loading && 'opacity-0')}>
        {icon && iconPosition === 'left' && (
          <span className={cn('flex-shrink-0 transition-transform duration-200 group-hover:scale-110', iconSizes[size])}>
            {icon}
          </span>
        )}
        
        <span className="flex-1">{children}</span>
        
        {icon && iconPosition === 'right' && (
          <span className={cn('flex-shrink-0 transition-transform duration-200 group-hover:scale-110', iconSizes[size])}>
            {icon}
          </span>
        )}
      </div>
    </button>
  );
};