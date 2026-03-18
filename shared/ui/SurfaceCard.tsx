"use client";

import { cn } from "@/shared/lib/utils";

interface SurfaceCardProps {
    children: React.ReactNode;
    className?: string;
    tone?: "default" | "subtle" | "strong";
}

export function SurfaceCard({ children, className, tone = "default" }: SurfaceCardProps) {
    return (
        <div
            className={cn(
                "surface-card",
                tone === "subtle" && "surface-card-subtle",
                tone === "strong" && "surface-card-strong",
                className
            )}
        >
            {children}
        </div>
    );
}
