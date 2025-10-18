'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showBell?: boolean;
  showMenu?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showBackButton = false,
  showSearch = false,
  showBell = false,
  showMenu = false,
  onBackPress,
  onSearchPress,
  onBellPress,
  onMenuPress,
  rightAction,
  className
}: MobileHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border",
        "safe-area-top"
      )}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackPress}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            <motion.h1
              className="text-lg font-semibold text-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSearchPress}
                  className="h-9 w-9 p-0"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            
            {showBell && (
              <motion.div whileTap={{ scale: 0.9 }} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBellPress}
                  className="h-9 w-9 p-0"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </motion.div>
            )}
            
            {showMenu && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuPress}
                  className="h-9 w-9 p-0"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            
            {rightAction}
          </div>
        </div>
      </div>
    </motion.div>
  );
}