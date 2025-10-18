'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const [time, setTime] = useState(new Date());
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-b border-border",
        "safe-area-top"
      )}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between px-6 py-2 text-xs">
          {/* Time */}
          <motion.span
            className="font-medium text-foreground"
            key={formatTime(time)}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatTime(time)}
          </motion.span>

          {/* Status Icons */}
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Signal className="w-3 h-3 text-foreground" />
            </motion.div>
            <Wifi className="w-3 h-3 text-foreground" />
            <div className="flex items-center gap-1">
              <Battery className="w-4 h-3 text-foreground" />
              <span className="text-foreground">85%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}