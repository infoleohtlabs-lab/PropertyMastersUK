import * as React from 'react';
import { cn } from '../../utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  variant?: 'default' | 'dashed' | 'dotted' | 'thick' | 'gradient';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'muted' | 'primary' | 'secondary';
  label?: string;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ 
    className, 
    orientation = 'horizontal', 
    decorative = true, 
    variant = 'default',
    spacing = 'none',
    color = 'default',
    label,
    ...props 
  }, ref) => {
    const spacingClasses = {
      none: '',
      sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
      md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
      xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
    };

    const colorClasses = {
      default: 'border-gray-200',
      muted: 'border-gray-100',
      primary: 'border-primary-200',
      secondary: 'border-secondary-200',
    };

    const variantClasses = {
      default: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
      thick: 'border-solid border-2',
      gradient: 'border-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent',
    };

    const getOrientationClasses = () => {
      if (orientation === 'horizontal') {
        return variant === 'gradient' 
          ? 'h-[1px] w-full' 
          : 'border-t w-full';
      } else {
        return variant === 'gradient'
          ? 'w-[1px] h-full bg-gradient-to-b'
          : 'border-l h-full';
      }
    };

    if (label && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative flex items-center',
            spacingClasses[spacing],
            className
          )}
          role={decorative ? 'none' : 'separator'}
          aria-orientation={decorative ? undefined : orientation}
          {...props}
        >
          <div className={cn(
            'flex-1',
            getOrientationClasses(),
            colorClasses[color],
            variantClasses[variant]
          )} />
          <span className="px-3 text-sm text-gray-500 bg-white">
            {label}
          </span>
          <div className={cn(
            'flex-1',
            getOrientationClasses(),
            colorClasses[color],
            variantClasses[variant]
          )} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          getOrientationClasses(),
          colorClasses[color],
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';

export { Separator };