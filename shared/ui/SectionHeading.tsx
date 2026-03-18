"use client";

import { cn } from "@/shared/lib/utils";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    className,
}: SectionHeadingProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
            <div className="space-y-2">
                <div className="section-kicker">{eyebrow}</div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">{title}</h2>
                    {description && (
                        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
