'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDangerous ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}
        >
          <AlertTriangle
            size={24}
            className={isDangerous ? 'text-red-400' : 'text-blue-400'}
          />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-dark-border text-gray-300 hover:bg-dark-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange hover:bg-orange-light text-dark'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
