import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  border?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function Card({ 
  children, 
  className, 
  shadow = 'md',
  hover = false,
  border = true
}: CardProps) {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div className={cn(
      'bg-white rounded-xl transition-all duration-200',
      shadowClasses[shadow],
      border && 'border border-gray-200',
      hover && 'hover:shadow-lg hover:scale-[1.02] hover:border-gray-300',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, divider = true }: CardHeaderProps) {
  return (
    <div className={cn(
      'px-6 py-4',
      divider && 'border-b border-gray-200',
      className
    )}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, padding = 'md' }: CardContentProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, divider = true }: CardFooterProps) {
  return (
    <div className={cn(
      'px-6 py-4',
      divider && 'border-t border-gray-200',
      className
    )}>
      {children}
    </div>
  );
}
