import React from 'react';
import { cn } from '../../utils/cn';
import { Input, InputProps } from './input';
import { Button } from './button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FormFieldProps extends InputProps {
  name: string;
  required?: boolean;
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  spacing?: 'compact' | 'default' | 'spacious';
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

interface FormMessageProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, required, label, className, ...props }, ref) => {
    const fieldLabel = label || name.charAt(0).toUpperCase() + name.slice(1);
    
    return (
      <div className={cn('form-group', className)}>
        <Input
          ref={ref}
          name={name}
          label={required ? `${fieldLabel} *` : fieldLabel}
          {...props}
        />
      </div>
    );
  }
);
FormField.displayName = 'FormField';

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn('form-section', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className,
  spacing = 'default'
}) => {
  const spacingClasses = {
    compact: 'space-y-3',
    default: 'space-y-4',
    spacious: 'space-y-6'
  };
  
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full',
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </form>
  );
};

const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };
  
  return (
    <div className={cn(
      'flex items-center gap-3 pt-4 border-t border-gray-200',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

const FormMessage: React.FC<FormMessageProps> = ({
  type,
  message,
  className
}) => {
  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    }
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      <p className={cn('text-sm font-medium', config.textColor)}>
        {message}
      </p>
    </div>
  );
};

// Form Grid for multi-column layouts
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export {
  Form,
  FormField,
  FormSection,
  FormActions,
  FormMessage,
  FormGrid
};

export type {
  FormProps,
  FormFieldProps,
  FormSectionProps,
  FormActionsProps,
  FormMessageProps,
  FormGridProps
};