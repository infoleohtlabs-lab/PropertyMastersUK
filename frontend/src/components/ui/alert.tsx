import React from 'react';
import { cn } from '../../utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
  children?: React.ReactNode;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}) => {
  const variantStyles = {
    default: 'border-gray-200 bg-gray-50 text-gray-900',
    destructive: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900'
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <p
      className={cn('text-sm leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export { Alert, AlertDescription };
ex