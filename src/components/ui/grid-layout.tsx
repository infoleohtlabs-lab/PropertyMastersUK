import React from 'react';
import { cn } from '../../utils/cn';

interface GridLayoutProps {
  children: React.ReactNode;
  variant?: 'auto-fit' | 'auto-fill' | 'fixed';
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  minItemWidth?: string;
  className?: string;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  variant = 'auto-fit',
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap = 'md',
  minItemWidth = '280px',
  className,
}) => {
  const getGapClass = (gap: string) => {
    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
    };
    return gaps[gap as keyof typeof gaps] || gaps.md;
  };

  const getGridClasses = () => {
    switch (variant) {
      case 'auto-fit':
        return `grid-auto-fit`;
      case 'auto-fill':
        return `grid grid-cols-[repeat(auto-fill,minmax(${minItemWidth},1fr))]`;
      case 'fixed':
      default:
        return cn(
          'grid',
          `grid-cols-${columns.mobile}`,
          `sm:grid-cols-${columns.tablet}`,
          `lg:grid-cols-${columns.desktop}`,
          `xl:grid-cols-${columns.wide}`
        );
    }
  };

  return (
    <div
      className={cn(
        getGridClasses(),
        getGapClass(gap),
        className
      )}
      style={{
        ...(variant === 'auto-fit' && {
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        }),
      }}
    >
      {children}
    </div>
  );
};

// Specialized grid layouts
interface PropertyGridProps extends Omit<GridLayoutProps, 'variant' | 'columns'> {
  view?: 'grid' | 'list';
  density?: 'comfortable' | 'compact';
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  children,
  view = 'grid',
  density = 'comfortable',
  gap = 'md',
  className,
  ...props
}) => {
  if (view === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    );
  }

  const columns = density === 'compact'
    ? { mobile: 1, tablet: 3, desktop: 4, wide: 5 }
    : { mobile: 1, tablet: 2, desktop: 3, wide: 4 };

  return (
    <GridLayout
      variant="fixed"
      columns={columns}
      gap={gap}
      className={className}
      {...props}
    >
      {children}
    </GridLayout>
  );
};

interface DashboardGridProps extends Omit<GridLayoutProps, 'variant'> {
  layout?: 'widgets' | 'charts' | 'mixed';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  layout = 'widgets',
  gap = 'lg',
  className,
  ...props
}) => {
  const getLayoutColumns = () => {
    switch (layout) {
      case 'widgets':
        return { mobile: 1, tablet: 2, desktop: 4, wide: 4 };
      case 'charts':
        return { mobile: 1, tablet: 1, desktop: 2, wide: 3 };
      case 'mixed':
        return { mobile: 1, tablet: 2, desktop: 3, wide: 4 };
      default:
        return { mobile: 1, tablet: 2, desktop: 3, wide: 4 };
    }
  };

  return (
    <GridLayout
      variant="fixed"
      columns={getLayoutColumns()}
      gap={gap}
      className={className}
      {...props}
    >
      {children}
    </GridLayout>
  );
};

// Masonry-style layout for varied content heights
interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  gap = 'md',
  className,
}) => {
  const getGapClass = (gap: string) => {
    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };
    return gaps[gap as keyof typeof gaps] || gaps.md;
  };

  return (
    <div
      className={cn(
        'columns-1',
        `sm:columns-${columns.tablet}`,
        `lg:columns-${columns.desktop}`,
        getGapClass(gap),
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid mb-6">
          {child}
        </div>
      ))}
    </div>
  );
};

// Responsive container for grid layouts
interface GridContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const GridContainer: React.FC<GridContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = 'md',
  className,
}) => {
  const getMaxWidthClass = (maxWidth: string) => {
    const widths = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    };
    return widths[maxWidth as keyof typeof widths] || widths.full;
  };

  const getPaddingClass = (padding: string) => {
    const paddings = {
      none: '',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
    };
    return paddings[padding as keyof typeof paddings] || paddings.md;
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        getMaxWidthClass(maxWidth),
        getPaddingClass(padding),
        className
      )}
    >
      {children}
    </div>
  );
};

// Flex-based alternative for simpler layouts
interface FlexGridProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const FlexGrid: React.FC<FlexGridProps> = ({
  children,
  direction = 'row',
  wrap = true,
  gap = 'md',
  justify = 'start',
  align = 'start',
  className,
}) => {
  const getGapClass = (gap: string) => {
    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
    };
    return gaps[gap as keyof typeof gaps] || gaps.md;
  };

  const getJustifyClass = (justify: string) => {
    const justifies = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };
    return justifies[justify as keyof typeof justifies] || justifies.start;
  };

  const getAlignClass = (align: string) => {
    const aligns = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };
    return aligns[align as keyof typeof aligns] || aligns.start;
  };

  return (
    <div
      className={cn(
        'flex',
        direction === 'column' ? 'flex-col' : 'flex-row',
        wrap && 'flex-wrap',
        getGapClass(gap),
        getJustifyClass(justify),
        getAlignClass(align),
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  GridLayout,
  PropertyGrid,
  DashboardGrid,
  MasonryGrid,
  GridContainer,
  FlexGrid,
};

export type {
  GridLayoutProps,
  PropertyGridProps,
  DashboardGridProps,
  MasonryGridProps,
  GridContainerProps,
  FlexGridProps,
};