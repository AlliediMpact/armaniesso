'use client';

import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-200',
    error: 'bg-red-500/20 border-red-500/30 text-red-200',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
  };

  const icons = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} backdrop-blur-sm`}>
        <Icon size={20} className="flex-shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
