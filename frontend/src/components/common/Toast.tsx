"use client";
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number; // ms
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setOpen(false); onClose?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);
  if (!open) return null;
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="px-4 py-2 rounded bg-green-600 text-white shadow">
        {message}
      </div>
    </div>
  );
};

export default Toast;
