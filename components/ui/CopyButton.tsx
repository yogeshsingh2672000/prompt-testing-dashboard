"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`cursor-pointer p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-teal-400 group/copy relative ${className}`}
            title="Copy to clipboard"
        >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-xl whitespace-nowrap z-[100]">
                    Copied!
                </span>
            )}
        </button>
    );
}
