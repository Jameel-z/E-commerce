// src/hooks/use-toast.ts
import { useState } from "react";

type Toast = {
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success";
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000); // Auto-dismiss after 3 seconds
  };

  return { toast, toasts };
};
