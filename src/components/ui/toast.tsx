"use client";
import { useEffect } from "react";

export interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 1800);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#4e2e20] text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-fade-in">
      {message}
    </div>
  );
}
