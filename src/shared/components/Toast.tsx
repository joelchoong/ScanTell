"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10);
    // Auto dismiss
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // wait for fade-out
    }, duration);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [duration, onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-[320px] w-full transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${isSuccess ? "bg-white border border-green-200" : "bg-white border border-red-200"}`}
    >
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
      }
      <span className={isSuccess ? "text-green-800" : "text-red-800"}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="ml-auto text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
