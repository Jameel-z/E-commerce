"use client";

import { createContext, useContext } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

export type ToastInput = Omit<Toast, "id">;

export type ToastContextValue = {
  toasts: Toast[];
  toast: (t: ToastInput) => void;
  dismiss: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}
