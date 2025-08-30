import React from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success' | 'search';
  size?: 'sm' | 'default' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  helperText?: string;
  label?: string;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'default',
    size = 'default',
    leftIcon,
    rightIcon,
    error,
    success,
    helperText,
    label,
    showPasswordToggle = false,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);
    
    React.useEffect(() => {
      if (showPasswordToggle && type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [showPassword, type, showPasswordToggle]);
    
    const baseClasses = 'input-field transition-all duration-200 focus:ring-2 focus:ring-offset-0';
    
    const variants = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50',
      search: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10',
    };
    
    const sizes = {
      sm: 'h-8 px-2.5 py-1.5 text-sm rounded-md',
      default: 'h-10 px-3 py-2.5 text-sm rounded-lg',
      lg: 'h-12 px-4 py-3 text-base rounded-lg',
    };
    
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;
    
    const inputElement = (
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        {/* Search Icon for search variant */}
        {variant === 'search' && !leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
        )}
        
        <input
          type={inputType}
          className={cn(
            baseClasses,
            variants[currentVariant],
            sizes[size],
            leftIcon && 'pl-10',
            (rightIcon || showPasswordToggle || hasError || hasSuccess) && 'pr-10',
            variant === 'search' && !leftIcon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Error Icon */}
          {hasError && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          
          {/* Success Icon */}
          {hasSuccess && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          
          {/* Password Toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Custom Right Icon */}
          {rightIcon && !hasError && !hasSuccess && (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
    
    if (label || error || success || helperText) {
      return (
        <div className="form-group">
          {label && (
            <label className="text-label mb-2 block">
              {label}
            </label>
          )}
          {inputElement}
          {error && (
            <p className="text-caption text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-caption text-green-600 mt-1 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-caption text-gray-500 mt-1">
              {helperText}
            </p>
          )}
        </div>
      );
    }
    
    return inputElement;
  }
);
Input.displayName = 'Input';

export { Input };
export type { InputProps };