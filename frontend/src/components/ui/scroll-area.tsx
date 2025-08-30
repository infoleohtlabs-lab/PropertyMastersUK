import * as React from 'react';
import { cn } from '../../utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollHideDelay?: number;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  scrollbarSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'rounded';
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ 
    className, 
    children, 
    orientation = 'vertical',
    scrollHideDelay = 600,
    type = 'hover',
    scrollbarSize = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const [isScrolling, setIsScrolling] = React.useState(false);
    const [showScrollbar, setShowScrollbar] = React.useState(type === 'always');
    const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();
    const containerRef = React.useRef<HTMLDivElement>(null);

    const scrollbarSizeClasses = {
      sm: 'scrollbar-thin',
      md: 'scrollbar',
      lg: 'scrollbar-thick',
    };

    const variantClasses = {
      default: 'scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400',
      minimal: 'scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300',
      rounded: 'scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded scrollbar-track-rounded',
    };

    const orientationClasses = {
      vertical: 'overflow-y-auto overflow-x-hidden',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      both: 'overflow-auto',
    };

    const handleScroll = React.useCallback(() => {
      if (type === 'hover' || type === 'auto') {
        setIsScrolling(true);
        setShowScrollbar(true);
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          if (type === 'hover') {
            setShowScrollbar(false);
          }
        }, scrollHideDelay);
      }
    }, [type, scrollHideDelay]);

    const handleMouseEnter = React.useCallback(() => {
      if (type === 'hover') {
        setShowScrollbar(true);
      }
    }, [type]);

    const handleMouseLeave = React.useCallback(() => {
      if (type === 'hover' && !isScrolling) {
        setShowScrollbar(false);
      }
    }, [type, isScrolling]);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('scroll', handleScroll, { passive: true });
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [handleScroll, handleMouseEnter, handleMouseLeave]);

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        <div
          ref={containerRef}
          className={cn(
            'h-full w-full',
            orientationClasses[orientation],
            scrollbarSizeClasses[scrollbarSize],
            variantClasses[variant],
            (type === 'hover' || type === 'auto') && !showScrollbar && 'scrollbar-hide',
            'transition-all duration-200'
          )}
          style={{
            scrollbarWidth: type === 'always' || showScrollbar ? 'auto' : 'none',
            msOverflowStyle: type === 'always' || showScrollbar ? 'auto' : 'none',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };