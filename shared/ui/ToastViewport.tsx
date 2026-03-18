"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ToastItem {
    id: string;
    title: string;
    message?: string;
    variant?: "error" | "success";
}

interface ToastViewportProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
            {toasts.map((toast) => {
                const isError = toast.variant !== "success";

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            "rounded-[1.75rem] border px-5 py-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-300",
                            isError
                                ? "border-red-200 bg-white/95 text-red-700 dark:border-red-500/30 dark:bg-zinc-950/95 dark:text-red-300"
                                : "border-emerald-200 bg-white/95 text-emerald-700 dark:border-emerald-500/30 dark:bg-zinc-950/95 dark:text-emerald-300"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn("mt-0.5", isError ? "text-red-500" : "text-emerald-500")}>
                                {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-black tracking-tight">{toast.title}</p>
                                {toast.message && (
                                    <p className="text-xs leading-relaxed opacity-80">{toast.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => onDismiss(toast.id)}
                                className="rounded-full p-1 opacity-50 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
                                aria-label="Dismiss notification"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
