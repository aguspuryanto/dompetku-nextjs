'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Settings, 
  Plus,
  Wallet,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticButton } from '@/hooks/useHapticFeedback';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const hapticFeedback = useHapticButton('medium');
  
  const tabs = [
    {
      id: 'home',
      label: 'Beranda',
      icon: Home,
      badge: null
    },
    {
      id: 'statistics',
      label: 'Statistik',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'add',
      label: 'Tambah',
      icon: Plus,
      badge: null,
      isSpecial: true
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: Calendar,
      badge: null
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            if (tab.isSpecial) {
              return (
                <motion.div
                  key={tab.id}
                  className="relative"
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.button
                    onClick={() => {
                      hapticFeedback.onClick();
                      onTabChange(tab.id);
                    }}
                    className={cn(
                      "relative flex items-center justify-center w-14 h-14 rounded-full",
                      "bg-gradient-to-r from-blue-500 to-purple-600",
                      "text-white shadow-lg",
                      "border-2 border-background"
                    )}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              );
            }
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  hapticFeedback.onClick();
                  onTabChange(tab.id);
                }}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                  "min-w-0 flex-1",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.8,
                      opacity: isActive ? 1 : 0.7
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <motion.span
                  className={cn(
                    "text-xs mt-1 font-medium truncate max-w-full",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  animate={{
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.7
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}