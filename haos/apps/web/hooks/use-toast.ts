'use client';

import { useState, useCallback } from 'react';

export interface ToastData {
  title?: string;
  description?: string;
  duration?: number;
  className?: string;
  action?: React.ReactElement;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastData & { id: number }>>([]);

  const toast = useCallback((toastData: ToastData) => {
    const id = toastId++;
    const newToast = { ...toastData, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide after duration
    const duration = toastData.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const dismiss = useCallback((toastId?: number) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}