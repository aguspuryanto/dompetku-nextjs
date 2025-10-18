'use client';

import { useRef, useState, useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

export function useSwipeGestures(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true
  } = options;

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (preventDefault) {
      // Only prevent default for horizontal swipes to allow vertical scrolling
      const touch = e.targetTouches[0];
      const startX = touchStart.current?.x || 0;
      const diffX = touch.clientX - startX;
      
      if (Math.abs(diffX) > Math.abs(touch.clientY - (touchStart.current?.y || 0))) {
        e.preventDefault();
      }
    }
    
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;

    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    if (isUpSwipe && onSwipeUp) {
      onSwipeUp();
    }
    if (isDownSwipe && onSwipeDown) {
      onSwipeDown();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, threshold = 80, disabled = false } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    
    // Only enable pull-to-refresh when at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isPulling) return;
    
    const touch = e.touches[0];
    currentY.current = touch.clientY;
    
    const distance = currentY.current - startY.current;
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5)); // Add resistance
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    pullToRefreshProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}