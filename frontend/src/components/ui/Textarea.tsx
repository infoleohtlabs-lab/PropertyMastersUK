import * as React from 'react';
import { cn } from '../../utils';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCharCount?: boolean;
  maxLength?: number;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    size = 'md',
    variant = 'default',
    resize = 'vertical',
    showCharCount = false,
    maxLength,
    required = false,
    labelClassName,
    containerClassName,
    value,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      if (showCharCount && value) {
        setCharCount(String(value).length);
      }
    }, [value, showCharCount]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

    const sizeClasses = {
      sm: 'min-h-[60px] px-2.5 py-1.5 text-sm',
      md: 'min-h-[80px] px-3 py-2 text-sm',
      lg: 'min-h-[100px] px-4 py-3 text-base'
    };

    const variantClasses = {
      default: cn(
        'border border-secondary-300 bg-white',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
      ),
      filled: cn(
        'border-0 bg-secondary-100',
        'focus:bg-white focus:ring-2 focus:ring-primary-500/20',
        error && 'bg-danger-50 focus:ring-danger-500/20'
      ),
      underlined: cn(
        'border-0 border-b-2 border-secondary-300 bg-transparent rounded-none px-0',
        'focus:border-primary-500 focus:ring-0',
        error && 'border-danger-500 focus:border-danger-500'
      )
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className={cn(
            'block text-sm font-medium text-secondary-700 mb-2',
            error && 'text-danger-700',
            labelClassName
          )}>
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            className={cn(
              'flex w-full rounded-lg transition-all duration-200',
              'placeholder:text-secondary-400',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50',
              'focus:outline-none',
              sizeClasses[size],
              variantClasses[variant],
              resizeClasses[resize],
              className
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            onChange={handleChange}
            {...props}
          />
          
          {error && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-4 w-4 text-danger-500" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-danger-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-secondary-500 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {helperText}
              </p>
            )}
          </div>
          
          {showCharCount && (
            <div className={cn(
              'text-xs',
              maxLength && charCount > maxLength * 0.9 ? 'text-warning-600' : 'text-secondary-400',
              maxLength && charCount >= maxLength && 'text-danger-600'
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };