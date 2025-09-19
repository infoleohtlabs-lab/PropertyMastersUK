import React from 'react';
import { cn } from '../../utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ className, checked, ...props }) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        {...props}
      />
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white transition-colors',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
          checked && 'bg-blue-600 border-blue-600 text-white',
          className
        )}
      >
        {checked && (
          <Check className="h-3 w-3" />
        )}
      </div>
    </div>
  );
};

export default Checkbox;