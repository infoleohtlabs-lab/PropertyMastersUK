import * as React from 'react';
import { cn } from '../../utils';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  disabled?: boolean;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  loop?: boolean;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  forceMount?: boolean;
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  disabled?: boolean;
}>({});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    value, 
    onValueChange, 
    children, 
    orientation = 'horizontal',
    size = 'md',
    variant = 'default',
    disabled = false,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || '');
    const currentValue = value !== undefined ? value : internalValue;
    const handleValueChange = onValueChange || setInternalValue;

    return (
      <TabsContext.Provider value={{ 
        value: currentValue, 
        onValueChange: handleValueChange,
        orientation,
        size,
        variant,
        disabled
      }}>
        <div
          ref={ref}
          className={cn(
            'w-full',
            orientation === 'vertical' && 'flex gap-4',
            className
          )}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, loop = true, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const { orientation, size, variant } = context;

    const sizeClasses = {
      sm: orientation === 'horizontal' ? 'h-8' : 'w-8',
      md: orientation === 'horizontal' ? 'h-10' : 'w-10', 
      lg: orientation === 'horizontal' ? 'h-12' : 'w-12'
    };

    const variantClasses = {
      default: 'bg-gray-100 text-gray-600 rounded-md p-1',
      pills: 'bg-transparent text-gray-600 gap-1',
      underline: 'bg-transparent text-gray-600 border-b border-gray-200',
      bordered: 'bg-white border border-gray-200 rounded-md p-1'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-start',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          sizeClasses[size || 'md'],
          variantClasses[variant || 'default'],
          className
        )}
        role="tablist"
        aria-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, icon, badge, disabled, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;
    const isDisabled = disabled || context.disabled;

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const getVariantClasses = () => {
      const base = 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200';
      const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
      const disabled = 'disabled:pointer-events-none disabled:opacity-50';
      
      switch (context.variant) {
        case 'pills':
          return cn(
            base, focus, disabled,
            'rounded-full',
            isActive 
              ? 'bg-primary-100 text-primary-700 shadow-sm' 
              : 'hover:bg-gray-100 text-gray-600'
          );
        case 'underline':
          return cn(
            base, focus, disabled,
            'rounded-none border-b-2 border-transparent',
            isActive 
              ? 'border-primary-500 text-primary-600' 
              : 'hover:border-gray-300 text-gray-600'
          );
        case 'bordered':
          return cn(
            base, focus, disabled,
            'rounded-md border border-transparent',
            isActive 
              ? 'border-primary-200 bg-primary-50 text-primary-700' 
              : 'hover:bg-gray-50 text-gray-600'
          );
        default:
          return cn(
            base, focus, disabled,
            'rounded-sm',
            isActive 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'hover:bg-white/50 text-gray-600'
          );
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          getVariantClasses(),
          sizeClasses[context.size || 'md'],
          className
        )}
        onClick={() => !isDisabled && context.onValueChange?.(value)}
        disabled={isDisabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        id={`tab-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        {...props}
      >
        {icon && (
          <span className="mr-2 flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
        {badge && (
          <span className={cn(
            'ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs',
            isActive ? 'bg-primary-200 text-primary-800' : 'bg-gray-200 text-gray-600'
          )}>
            {badge}
          </span>
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, forceMount = false, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;

    if (!isActive && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          context.orientation === 'vertical' && 'flex-1',
          !isActive && forceMount && 'hidden',
          className
        )}
        role="tabpanel"
        aria-labelledby={`tab-${value}`}
        id={`tabpanel-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };