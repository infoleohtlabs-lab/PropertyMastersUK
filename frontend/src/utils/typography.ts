import { cn } from './index';

// Typography scale based on design system
export const typography = {
  // Display text (for hero sections, large headings)
  display: {
    '2xl': 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight',
    'xl': 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    'lg': 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    'md': 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
    'sm': 'text-xl md:text-2xl lg:text-3xl font-bold tracking-tight',
  },
  
  // Headings
  heading: {
    'h1': 'text-3xl md:text-4xl font-bold text-gray-900 tracking-tight',
    'h2': 'text-2xl md:text-3xl font-bold text-gray-900 tracking-tight',
    'h3': 'text-xl md:text-2xl font-semibold text-gray-900 tracking-tight',
    'h4': 'text-lg md:text-xl font-semibold text-gray-900',
    'h5': 'text-base md:text-lg font-semibold text-gray-900',
    'h6': 'text-sm md:text-base font-semibold text-gray-900',
  },
  
  // Body text
  body: {
    'xl': 'text-xl leading-relaxed text-gray-700',
    'lg': 'text-lg leading-relaxed text-gray-700',
    'md': 'text-base leading-relaxed text-gray-700',
    'sm': 'text-sm leading-relaxed text-gray-600',
    'xs': 'text-xs leading-relaxed text-gray-600',
  },
  
  // Labels and captions
  label: {
    'lg': 'text-sm font-medium text-gray-900',
    'md': 'text-sm font-medium text-gray-700',
    'sm': 'text-xs font-medium text-gray-700',
  },
  
  // Captions and helper text
  caption: {
    'lg': 'text-sm text-gray-600',
    'md': 'text-xs text-gray-600',
    'sm': 'text-xs text-gray-500',
  },
  
  // Code and monospace
  code: {
    'lg': 'text-sm font-mono bg-gray-100 px-2 py-1 rounded',
    'md': 'text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded',
    'sm': 'text-xs font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700',
  },
};

// Spacing scale for consistent layout
export const spacing = {
  // Container spacing
  container: {
    'xs': 'px-4',
    'sm': 'px-4 sm:px-6',
    'md': 'px-4 sm:px-6 lg:px-8',
    'lg': 'px-4 sm:px-6 lg:px-8 xl:px-12',
    'xl': 'px-4 sm:px-6 lg:px-8 xl:px-16',
  },
  
  // Section spacing
  section: {
    'xs': 'py-8',
    'sm': 'py-12',
    'md': 'py-16',
    'lg': 'py-20',
    'xl': 'py-24',
    '2xl': 'py-32',
  },
  
  // Component spacing
  component: {
    'xs': 'p-2',
    'sm': 'p-4',
    'md': 'p-6',
    'lg': 'p-8',
    'xl': 'p-12',
  },
  
  // Stack spacing (vertical)
  stack: {
    'xs': 'space-y-2',
    'sm': 'space-y-4',
    'md': 'space-y-6',
    'lg': 'space-y-8',
    'xl': 'space-y-12',
  },
  
  // Inline spacing (horizontal)
  inline: {
    'xs': 'space-x-2',
    'sm': 'space-x-4',
    'md': 'space-x-6',
    'lg': 'space-x-8',
    'xl': 'space-x-12',
  },
  
  // Gap spacing (for grid/flex)
  gap: {
    'xs': 'gap-2',
    'sm': 'gap-4',
    'md': 'gap-6',
    'lg': 'gap-8',
    'xl': 'gap-12',
  },
};

// Layout utilities
export const layout = {
  // Max widths
  maxWidth: {
    'xs': 'max-w-xs',
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
    'screen': 'max-w-screen-2xl',
  },
  
  // Grid layouts
  grid: {
    'auto': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'auto-fit': 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
    'auto-fill': 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
    'responsive-2': 'grid grid-cols-1 md:grid-cols-2',
    'responsive-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'responsive-4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  
  // Flex layouts
  flex: {
    'center': 'flex items-center justify-center',
    'between': 'flex items-center justify-between',
    'start': 'flex items-center justify-start',
    'end': 'flex items-center justify-end',
    'col': 'flex flex-col',
    'col-center': 'flex flex-col items-center justify-center',
    'wrap': 'flex flex-wrap',
  },
};

// Helper functions for applying typography and spacing
export const getTypography = (variant: keyof typeof typography, size: string, className?: string) => {
  const baseClasses = typography[variant]?.[size as keyof typeof typography[typeof variant]] || '';
  return cn(baseClasses, className);
};

export const getSpacing = (variant: keyof typeof spacing, size: string, className?: string) => {
  const baseClasses = spacing[variant]?.[size as keyof typeof spacing[typeof variant]] || '';
  return cn(baseClasses, className);
};

export const getLayout = (variant: keyof typeof layout, size: string, className?: string) => {
  const baseClasses = layout[variant]?.[size as keyof typeof layout[typeof variant]] || '';
  return cn(baseClasses, className);
};

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Media query helpers
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

// Typography component classes for consistent styling
export const typographyComponents = {
  // Page headers
  pageHeader: 'mb-8 space-y-2',
  pageTitle: cn(typography.heading.h1, 'mb-2'),
  pageSubtitle: cn(typography.body.lg, 'text-gray-600'),
  
  // Section headers
  sectionHeader: 'mb-6 space-y-1',
  sectionTitle: cn(typography.heading.h2, 'mb-1'),
  sectionSubtitle: cn(typography.body.md, 'text-gray-600'),
  
  // Card headers
  cardHeader: 'mb-4 space-y-1',
  cardTitle: cn(typography.heading.h3, 'mb-1'),
  cardSubtitle: cn(typography.body.sm, 'text-gray-600'),
  
  // Form sections
  formSection: 'space-y-6',
  formGroup: 'space-y-2',
  formLabel: cn(typography.label.md),
  formHelperText: cn(typography.caption.md),
  formErrorText: cn(typography.caption.md, 'text-red-600'),
  
  // Lists
  list: 'space-y-3',
  listItem: cn(typography.body.md),
  
  // Stats and metrics
  statValue: cn(typography.display.sm, 'text-gray-900'),
  statLabel: cn(typography.label.sm, 'text-gray-600'),
  
  // Navigation
  navLink: cn(typography.body.sm, 'font-medium text-gray-700 hover:text-gray-900'),
  navLinkActive: cn(typography.body.sm, 'font-medium text-blue-600'),
};

// Export all utilities
export default {
  typography,
  spacing,
  layout,
  getTypography,
  getSpacing,
  getLayout,
  breakpoints,
  mediaQueries,
  typographyComponents,
};