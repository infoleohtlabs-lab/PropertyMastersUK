import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'spacious' | 'elevated' | 'interactive';
  hover?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = 'default', hover = true, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'compact':
          return 'card-compact';
        case 'spacious':
          return 'card-spacious';
        case 'elevated':
          return 'bg-white rounded-xl shadow-medium border border-gray-200 p-6 hover:shadow-lg transition-all duration-300';
        case 'interactive':
          return 'bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-medium hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer';
        default:
          return 'card';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          getVariantClasses(),
          hover && variant === 'default' && 'hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-2 pb-4 border-b border-gray-100 mb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, size = 'md', ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'text-heading-4';
        case 'lg':
          return 'text-heading-2';
        default:
          return 'text-heading-3';
      }
    };

    return (
      <h3
        ref={ref}
        className={cn(
          getSizeClasses(),
          'text-gray-900 font-semibold leading-tight',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'text-body text-gray-700 leading-relaxed',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between pt-4 mt-4 border-t border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };