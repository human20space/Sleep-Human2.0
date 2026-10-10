import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all bg-white text-[#1F2A28] border-[#E6DCCB]">
      {isSuccess && <CheckCircle2 size={16} className="text-[#3C7858] shrink-0" />}
      {isError && <AlertCircle size={16} className="text-red-600 shrink-0" />}
      {!isSuccess && !isError && <div className="w-2 h-2 rounded-full bg-[#1F5F78] shrink-0" />}
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 p-1 text-[#5A6663] hover:text-[#1F2A28] rounded-md transition-colors cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={13} />
      </button>
    </div>
  );
};
