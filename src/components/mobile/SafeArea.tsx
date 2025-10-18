'use client';

import { cn } from '@/lib/utils';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export function SafeArea({ 
  children, 
  className,
  top = true,
  bottom = true,
  left = true,
  right = true
}: SafeAreaProps) {
  return (
    <div 
      className={cn(
        // iOS Safe Area
        top && 'pt-safe-or-11',
        bottom && 'pb-safe-or-11',
        left && 'pl-safe-or-11',
        right && 'pr-safe-or-11',
        // Android Safe Area
        top && 'pt-top-env',
        bottom && 'pb-bottom-env',
        left && 'pl-left-env',
        right && 'pr-right-env',
        className
      )}
    >
      {children}
    </div>
  );
}

// Custom CSS for safe areas
export const safeAreaStyles = `
  .safe-area-top {
    padding-top: env(safe-area-inset-top, 44px);
  }
  
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 34px);
  }
  
  .safe-area-left {
    padding-left: env(safe-area-inset-left, 0px);
  }
  
  .safe-area-right {
    padding-right: env(safe-area-inset-right, 0px);
  }
  
  .pt-safe-or-11 {
    padding-top: max(env(safe-area-inset-top), 44px);
  }
  
  .pb-safe-or-11 {
    padding-bottom: max(env(safe-area-inset-bottom), 34px);
  }
  
  .pl-safe-or-11 {
    padding-left: max(env(safe-area-inset-left), 11px);
  }
  
  .pr-safe-or-11 {
    padding-right: max(env(safe-area-inset-right), 11px);
  }
  
  .pt-top-env {
    padding-top: env(safe-area-inset-top, 24px);
  }
  
  .pb-bottom-env {
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }
  
  .pl-left-env {
    padding-left: env(safe-area-inset-left, 0px);
  }
  
  .pr-right-env {
    padding-right: env(safe-area-inset-right, 0px);
  }
`;