import { useState, useCallback } from "react";

type Toast = {
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success";
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Toast) => {
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  }, []);

  return { toast, toasts };
};
