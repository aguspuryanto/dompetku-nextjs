'use client';

import { useEffect, useState } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if haptic feedback is supported
    if ('vibrate' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const triggerHaptic = (type: HapticType = 'light') => {
    if (!isSupported) return;

    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'warning':
        navigator.vibrate([20, 100, 20]);
        break;
      case 'error':
        navigator.vibrate([30, 200, 30, 200, 30]);
        break;
      default:
        navigator.vibrate(10);
    }
  };

  const triggerClick = () => triggerHaptic('light');
  const triggerSelection = () => triggerHaptic('medium');
  const triggerSuccess = () => triggerHaptic('success');
  const triggerWarning = () => triggerHaptic('warning');
  const triggerError = () => triggerHaptic('error');

  return {
    isSupported,
    triggerHaptic,
    triggerClick,
    triggerSelection,
    triggerSuccess,
    triggerWarning,
    triggerError
  };
}

// Hook for adding haptic feedback to button clicks
export function useHapticButton(hapticType: HapticType = 'light') {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    triggerHaptic(hapticType);
  };

  return {
    onClick: handleClick,
    onTouchStart: handleClick
  };
}