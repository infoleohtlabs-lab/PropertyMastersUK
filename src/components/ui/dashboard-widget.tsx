import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '../../utils/cn';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'featured';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  color = 'blue',
  onClick,
  className,
  children,
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        icon: 'bg-blue-100 text-blue-600',
        trend: 'text-blue-600',
        accent: 'border-blue-200',
      },
      green: {
        icon: 'bg-green-100 text-green-600',
        trend: 'text-green-600',
        accent: 'border-green-200',
      },
      purple: {
        icon: 'bg-purple-100 text-purple-600',
        trend: 'text-purple-600',
        accent: 'border-purple-200',
      },
      orange: {
        icon: 'bg-orange-100 text-orange-600',
        trend: 'text-orange-600',
        accent: 'border-orange-200',
      },
      red: {
        icon: 'bg-red-100 text-red-600',
        trend: 'text-red-600',
        accent: 'border-red-200',
      },
      gray: {
        icon: 'bg-gray-100 text-gray-600',
        trend: 'text-gray-600',
        accent: 'border-gray-200',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCardVariant = () => {
    switch (variant) {
      case 'compact':
        return 'compact';
      case 'featured':
        return 'elevated';
      default:
        return 'default';
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card
      variant={getCardVariant()}
      className={cn(
        'group transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-medium hover:-translate-y-0.5',
        variant === 'featured' && `ring-1 ${colorClasses.accent}`,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0',
        variant === 'compact' ? 'pb-2' : 'pb-3'
      )}>
        <div className="flex items-center space-x-3">
          {icon && (
            <div className={cn(
              'p-2 rounded-lg',
              colorClasses.icon
            )}>
              {icon}
            </div>
          )}
          <div>
            <CardTitle 
              size={variant === 'compact' ? 'sm' : 'md'} 
              className="text-gray-700 font-medium"
            >
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-caption text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {onClick && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pt-0' : undefined}>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn(
              'font-bold text-gray-900',
              variant === 'compact' ? 'text-2xl' : 'text-3xl lg:text-4xl'
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {trend && (
              <div className="flex items-center space-x-2 mt-2">
                <div className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                  getTrendColor(trend.direction)
                )}>
                  {getTrendIcon(trend.direction)}
                  <span>
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                </div>
                {trend.period && (
                  <span className="text-caption text-gray-500">
                    {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized widget components
interface MetricWidgetProps extends Omit<DashboardWidgetProps, 'children'> {
  metric: {
    current: number;
    previous?: number;
    target?: number;
    unit?: string;
  };
}

const MetricWidget: React.FC<MetricWidgetProps> = ({
  metric,
  ...props
}) => {
  const calculateTrend = () => {
    if (!metric.previous) return undefined;
    
    const change = ((metric.current - metric.previous) / metric.previous) * 100;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
      period: 'vs last period',
    };
  };

  const formatValue = (value: number) => {
    if (metric.unit) {
      return `${value.toLocaleString()}${metric.unit}`;
    }
    return value.toLocaleString();
  };

  return (
    <DashboardWidget
      {...props}
      value={formatValue(metric.current)}
      trend={calculateTrend()}
    >
      {metric.target && (
        <div className="flex items-center justify-between text-caption text-gray-500 mt-2">
          <span>Target: {formatValue(metric.target)}</span>
          <span>
            {((metric.current / metric.target) * 100).toFixed(1)}% of target
          </span>
        </div>
      )}
    </DashboardWidget>
  );
};

// Chart widget wrapper
interface ChartWidgetProps extends Omit<DashboardWidgetProps, 'value'> {
  chart: React.ReactNode;
  summary?: {
    label: string;
    value: string | number;
  }[];
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  chart,
  summary,
  ...props
}) => {
  return (
    <Card
      variant={props.variant === 'featured' ? 'elevated' : 'default'}
      className={cn(
        'group transition-all duration-200',
        props.onClick && 'cursor-pointer hover:shadow-medium hover:-translate-y-0.5',
        props.className
      )}
      onClick={props.onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          {props.icon && (
            <div className={cn(
              'p-2 rounded-lg',
              getColorClasses(props.color || 'blue').icon
            )}>
              {props.icon}
            </div>
          )}
          <div>
            <CardTitle size="md" className="text-gray-700 font-medium">
              {props.title}
            </CardTitle>
            {props.subtitle && (
              <p className="text-caption text-gray-500 mt-1">
                {props.subtitle}
              </p>
            )}
          </div>
        </div>
        
        {props.onClick && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-64 mb-4">
          {chart}
        </div>
        
        {summary && summary.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {summary.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {item.value}
                </div>
                <div className="text-caption text-gray-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DashboardWidget, MetricWidget, ChartWidget };
export type { DashboardWidgetProps, MetricWidgetProps, ChartWidgetProps };