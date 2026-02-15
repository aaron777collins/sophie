import { useState, useRef, useCallback, TouchEvent, PointerEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  preventDefaultTouchHandling?: boolean;
}

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
}

interface LongPressOptions {
  onLongPress: (event: TouchEvent | PointerEvent) => void;
  delay?: number;
  enabled?: boolean;
}

// Hook for swipe gestures
export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 300,
  preventDefaultTouchHandling = false
}: SwipeGestureOptions) => {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefaultTouchHandling) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [preventDefaultTouchHandling]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Check if swipe meets threshold requirements
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && 
                             (Math.abs(deltaX) > threshold || velocityX > velocityThreshold);
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX) && 
                           (Math.abs(deltaY) > threshold || velocityY > velocityThreshold);

    if (isHorizontalSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  enabled = true
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    startY.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only allow pull-to-refresh at the top of the scroll container
    const scrollContainer = (e.target as Element).closest('[data-pull-refresh]');
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      return;
    }

    if (diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff, threshold * 2));
      setIsPulling(diff > threshold);
    }
  }, [enabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing) return;

    if (isPulling && pullDistance > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [enabled, isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    pullToRefreshHandlers: enabled ? {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    } : {},
    pullRefreshIndicator: isPulling || isRefreshing
  };
};

// Hook for long press gestures
export const useLongPress = ({
  onLongPress,
  delay = 500,
  enabled = true
}: LongPressOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback((event: TouchEvent | PointerEvent) => {
    if (!enabled) return;

    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress(event);
      setIsPressed(false);
    }, delay);
  }, [onLongPress, delay, enabled]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressed(false);
  }, []);

  const longPressHandlers = enabled ? {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerMove: cancel
  } : {};

  return {
    isPressed,
    ...longPressHandlers
  };
};

// Hook for pinch-to-zoom gestures
export const usePinchToZoom = (
  onZoom: (scale: number, center: { x: number; y: number }) => void,
  enabled = true
) => {
  const lastDistance = useRef<number>(0);
  const lastCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touches: TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return;

    e.preventDefault();
    lastDistance.current = getDistance(e.touches);
    lastCenter.current = getCenter(e.touches);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return;

    e.preventDefault();
    const distance = getDistance(e.touches);
    const center = getCenter(e.touches);

    if (lastDistance.current > 0) {
      const scale = distance / lastDistance.current;
      onZoom(scale, center);
    }

    lastDistance.current = distance;
    lastCenter.current = center;
  }, [enabled, onZoom]);

  const handleTouchEnd = useCallback(() => {
    lastDistance.current = 0;
  }, []);

  return enabled ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  } : {};
};

// Utility function to add mobile gesture custom events
export const addMobileGestureSupport = () => {
  if (typeof window === 'undefined') return;

  // Add custom events for Cypress testing
  const addCustomEvent = (name: string, handler: (element: Element, ...args: any[]) => void) => {
    (window as any)[name] = handler;
  };

  addCustomEvent('swipeRight', (element: Element) => {
    const event = new CustomEvent('swiperight', { bubbles: true });
    element.dispatchEvent(event);
  });

  addCustomEvent('swipeLeft', (element: Element) => {
    const event = new CustomEvent('swipeleft', { bubbles: true });
    element.dispatchEvent(event);
  });

  addCustomEvent('longPress', (element: Element) => {
    const event = new CustomEvent('longpress', { bubbles: true });
    element.dispatchEvent(event);
  });
};