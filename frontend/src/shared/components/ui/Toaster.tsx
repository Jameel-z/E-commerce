"use client";

import { useToast } from "@/shared/hooks/use-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isDestructive = t.variant === "destructive";
        const isSuccess = t.variant === "success";

        const Icon = isDestructive ? AlertCircle : isSuccess ? CheckCircle2 : Info;

        const styles = isDestructive
          ? "bg-red-600 text-white border-red-700"
          : isSuccess
          ? "bg-emerald-600 text-white border-emerald-700"
          : "bg-gray-900 text-white border-gray-800";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl animate-in slide-in-from-bottom-2 duration-300 ${styles}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-0.5 opacity-85 leading-snug">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
