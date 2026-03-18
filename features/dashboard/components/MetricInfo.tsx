"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function MetricInfo() {
    const t = useTranslations("ui.metrics");

    return (
        <div className="flex items-center gap-2">
            <button
                data-tooltip-id="main-tooltip"
                data-tooltip-content={t("info")}
                data-tooltip-html={`
                    <div class="space-y-4 p-1">
                        <div class="border-b border-white/10 pb-3">
                            <h3 class="text-teal-400 font-black text-xs uppercase tracking-widest mb-1">${t("similarity.title")}</h3>
                            <p class="text-zinc-400 text-[11px] leading-relaxed">${t("similarity.description")}</p>
                        </div>
                        <div>
                            <h3 class="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">${t("semantic.title")}</h3>
                            <p class="text-zinc-400 text-[11px] leading-relaxed">${t("semantic.description")}</p>
                        </div>
                    </div>
                `}
                className="p-2 rounded-xl text-zinc-400 hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 group/info"
            >
                <Info size={18} className="transition-transform group-hover/info:rotate-12" />
            </button>
        </div>
    );
}
