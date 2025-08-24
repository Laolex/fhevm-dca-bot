import React from 'react';
import { cn } from '../../lib/utils';

// Modern Card with Glass Morphism
interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hover?: boolean;
  style?: React.CSSProperties;
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  style
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200/50 dark:border-gray-700/50 shadow-lg',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg',
    elevated: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl',
  };

  const hoverClasses = hover ? 'hover:shadow-2xl hover:-translate-y-1' : '';

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

// Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  style
}) => {
  return (
    <ModernCard className={cn('p-6', className)} style={style}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↗' : '↘'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            {icon}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Feature Card
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
  style
}) => {
  return (
    <ModernCard variant="glass" className={cn('p-6', className)} style={style}>
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </ModernCard>
  );
};

// Action Card
interface ActionCardProps {
  title: string;
  description: string;
  action: React.ReactNode;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  action,
  className
}) => {
  return (
    <ModernCard variant="gradient" className={cn('p-6', className)}>
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
        {action}
      </div>
    </ModernCard>
  );
};

// Gradient Card
interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = 'from-blue-500/20 via-blue-400/10 to-transparent',
  className
}) => {
  return (
    <div className={cn(
      'rounded-xl bg-gradient-to-br',
      gradient,
      'p-6 border border-blue-500/20',
      className
    )}>
      {children}
    </div>
  );
};
