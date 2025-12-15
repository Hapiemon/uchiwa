'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const toastStore: {
  listeners: Set<(toast: ToastProps & { id: string }) => void>;
  show: (props: ToastProps) => void;
} = {
  listeners: new Set(),
  show(props) {
    const id = Math.random().toString();
    const toast = { ...props, id };
    this.listeners.forEach((listener) => listener(toast));
    if (props.duration !== -1) {
      setTimeout(() => {
        this.listeners.forEach((listener) => listener({ ...toast, message: '' }));
      }, props.duration || 3000);
    }
  },
};

export function useToast() {
  return {
    show: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      toastStore.show({ message, type });
    },
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  useEffect(() => {
    const listener = (toast: ToastProps & { id: string }) => {
      setToasts((prev) => {
        const existing = prev.find((t) => t.id === toast.id);
        if (!toast.message) {
          return prev.filter((t) => t.id !== toast.id);
        }
        if (existing) {
          return prev.map((t) => (t.id === toast.id ? toast : t));
        }
        return [...prev, toast];
      });
    };

    toastStore.listeners.add(listener);
    return () => {
      toastStore.listeners.delete(listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up ${
            toast.type === 'success' ? 'bg-pastel-mint text-green-800' :
            toast.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-pastel-lavender text-purple-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }}
            className="hover:opacity-70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
