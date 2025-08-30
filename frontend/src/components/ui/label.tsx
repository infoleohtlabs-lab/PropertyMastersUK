import React from 'react';
import { cn } from '../../utils';
import { AlertCircle } from 'lucide-react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'muted';
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  description?: string;
  tooltip?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    size = 'sm',
    variant = 'default',
    required = false,
    error = false,
    disabled = false,
    description,
    tooltip,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const variantClasses = {
      default: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500'
    };

    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            'font-medium leading-none transition-colors',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            sizeClasses[size],
            error ? 'text-danger-700' : disabled ? 'text-gray-400' : variantClasses[variant],
            className
          )}
          {...props}
        >
          <span className="flex items-center gap-1">
            {children}
            {required && (
              <span className="text-danger-500" aria-label="Required">
                *
              </span>
            )}
            {error && (
              <AlertCircle className="h-3 w-3 text-danger-500" />
            )}
            {tooltip && (
              <span 
                className="text-gray-400 cursor-help" 
                title={tooltip}
                aria-label={tooltip}
              >
                ?
              </span>
            )}
          </span>
        </label>
        {description && (
          <p className={cn(
            'text-xs leading-relaxed',
            error ? 'text-danger-600' : 'text-gray-500'
          )}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = 'Label';

// Field Label - for form fields with consistent spacing
interface FieldLabelProps extends LabelProps {
  htmlFor: string;
  optional?: boolean;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ optional = false, required, children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        required={required && !optional}
        {...props}
      >
        {children}
        {optional && !required && (
          <span className="text-gray-400 font-normal ml-1">
            (optional)
          </span>
        )}
      </Label>
    );
  }
);

FieldLabel.displayName = 'FieldLabel';

export { Label };
export default Label;