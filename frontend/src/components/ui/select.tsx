import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  error?: boolean;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select provider');
  }
  return context;
};

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  error?: boolean;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  children, 
  value, 
  defaultValue = '', 
  onValueChange,
  disabled = false,
  required = false,
  name,
  size = 'md',
  variant = 'default',
  error = false,
  helperText
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      setOpen,
      disabled,
      required,
      name,
      size,
      variant,
      error
    }}>
      <div className="relative w-full">
        {children}
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-danger-600" : "text-gray-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    </SelectContext.Provider>
  );
};

// Select Group for organizing options
interface SelectGroupProps {
  children: React.ReactNode;
  label?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ children, label }) => {
  return (
    <div className="py-1">
      {label && (
        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

// Select Separator
export const SelectSeparator: React.FC = () => {
  return <div className="my-1 h-px bg-gray-200" />;
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  loading?: boolean;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ 
  children, 
  className = '',
  placeholder,
  loading = false
}) => {
  const { open, setOpen, disabled, size, variant, error } = useSelect();
  
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const variantClasses = {
    default: cn(
      'border bg-white',
      error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
      'hover:border-gray-400'
    ),
    filled: cn(
      'border-0 bg-gray-100',
      error ? 'bg-danger-50 focus:bg-danger-100' : 'focus:bg-gray-200',
      'hover:bg-gray-200'
    ),
    underlined: cn(
      'border-0 border-b-2 bg-transparent rounded-none px-0',
      error ? 'border-danger-300 focus:border-danger-500' : 'border-gray-300 focus:border-primary-500'
    )
  };
  
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'flex w-full items-center justify-between rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size || 'md'],
        variantClasses[variant || 'default'],
        className
      )}
      onClick={() => !disabled && !loading && setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <div className="flex items-center flex-1 min-w-0">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
        ) : null}
        <div className="truncate">
          {children}
        </div>
      </div>
      <div className="flex items-center ml-2">
        {error && !loading && (
          <AlertCircle className="h-4 w-4 text-danger-500 mr-1" />
        )}
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </div>
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = 'Select...', className = '' }) => {
  const { value } = useSelect();
  
  return (
    <span className={cn(
      'block truncate',
      !value && 'text-gray-500',
      className
    )}>
      {value || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'auto';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  className = '',
  position = 'bottom',
  align = 'start',
  sideOffset = 4
}) => {
  const { open, setOpen, size } = useSelect();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen]);
  
  if (!open) return null;
  
  const positionClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
    auto: 'top-full mt-1' // Could be enhanced with collision detection
  };

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 min-w-[8rem] max-h-60 w-full overflow-auto',
        'rounded-md border border-gray-200 bg-white shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        positionClasses[position],
        alignClasses[align],
        sizeClasses[size || 'md'],
        className
      )}
      role="listbox"
      style={{ marginTop: position === 'bottom' ? sideOffset : undefined, marginBottom: position === 'top' ? sideOffset : undefined }}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
  textValue?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  children, 
  value, 
  className = '',
  disabled = false,
  textValue
}) => {
  const { onValueChange, value: selectedValue, size } = useSelect();
  const isSelected = selectedValue === value;
  
  const sizeClasses = {
    sm: 'py-1.5 pl-2 pr-8 text-xs',
    md: 'py-2 pl-3 pr-9 text-sm',
    lg: 'py-2.5 pl-4 pr-10 text-base'
  };
  
  return (
    <div
      className={cn(
        'relative cursor-pointer select-none rounded-sm transition-colors duration-150',
        'focus:outline-none focus:bg-primary-50 focus:text-primary-900',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
        isSelected && 'bg-primary-50 text-primary-900 font-medium',
        sizeClasses[size || 'md'],
        className
      )}
      onClick={() => !disabled && onValueChange(value)}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-value={textValue || value}
    >
      <span className="block truncate">
        {children}
      </span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <Check className="h-4 w-4 text-primary-600" />
        </span>
      )}
    </div>
  );
};

// Multi-select variant
interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onValueChange'> {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  children,
  value = [],
  onValueChange,
  maxSelections,
  ...props
}) => {
  const handleValueChange = (newValue: string) => {
    if (!onValueChange) return;
    
    const currentValues = Array.isArray(value) ? value : [];
    const isSelected = currentValues.includes(newValue);
    
    if (isSelected) {
      // Remove value
      onValueChange(currentValues.filter(v => v !== newValue));
    } else {
      // Add value (if not at max)
      if (!maxSelections || currentValues.length < maxSelections) {
        onValueChange([...currentValues, newValue]);
      }
    }
  };
  
  return (
    <Select
      {...props}
      value={value.join(', ')}
      onValueChange={handleValueChange}
    >
      {children}
    </Select>
  );
};