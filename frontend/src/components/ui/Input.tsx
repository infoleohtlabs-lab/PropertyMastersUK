import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    label, 
    helperText, 
    size = 'md',
    variant = 'default',
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'w-full rounded-lg transition-all duration-300 ease-in-out transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-secondary-400 hover:shadow-sm focus:shadow-md';
    
    const variants = {
      default: 'border border-secondary-300 bg-white hover:border-secondary-400 hover:bg-gray-50/50 focus:border-primary-500 focus:ring-primary-500 focus:bg-white',
      filled: 'border-0 bg-secondary-100 hover:bg-secondary-200 hover:scale-[1.01] focus:bg-white focus:ring-primary-500 focus:scale-100',
      underlined: 'border-0 border-b-2 border-secondary-300 bg-transparent rounded-none hover:border-secondary-400 hover:bg-gray-50/30 focus:border-primary-500 focus:ring-0 focus:ring-offset-0 focus:bg-transparent',
    };
    
    const sizes = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };
    
    const paddingClasses = {
      sm: leftIcon ? 'pl-8 pr-3' : rightIcon ? 'pl-3 pr-8' : 'px-3',
      md: leftIcon ? 'pl-10 pr-4' : rightIcon ? 'pl-4 pr-10' : 'px-4',
      lg: leftIcon ? 'pl-12 pr-4' : rightIcon ? 'pl-4 pr-12' : 'px-4',
    };
    
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };
    
    const iconPositions = {
      sm: { left: 'left-2', right: 'right-2' },
      md: { left: 'left-3', right: 'right-3' },
      lg: { left: 'left-3', right: 'right-3' },
    };
    
    const isDisabled = disabled || loading;
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-secondary-700">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-secondary-400 pointer-events-none transition-all duration-300 group-focus-within:text-primary-500 group-focus-within:scale-110',
              iconPositions[size].left
            )}>
              <span className={iconSizes[size]}>{leftIcon}</span>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              paddingClasses[size],
              error && 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
              isDisabled && 'bg-secondary-50',
              className
            )}
            ref={ref}
            disabled={isDisabled}
            {...props}
          />
          
          {(rightIcon || loading) && (
            <div className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-secondary-400 transition-all duration-300 group-focus-within:text-primary-500 group-focus-within:scale-110',
              iconPositions[size].right
            )}>
              {loading ? (
                <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
              ) : (
                <span className={iconSizes[size]}>{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-danger-600 flex items-center gap-1">
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-secondary-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };