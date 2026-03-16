import { Filter, Sparkles, Wand2, Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SUPPORTED_MODELS } from "@/constants/models";
import { useState } from "react";
import { EvaluationResult } from "@/types";
import { cn } from "@/lib/utils";

interface ConfigSectionProps {
    systemPrompt: string;
    setSystemPrompt: (v: string) => void;
    userInput: string;
    setUserInput: (v: string) => void;
    batchSize: number;
    setBatchSize: (v: number) => void;
    threshold: number;
    setThreshold: (v: number) => void;
    modelId: string;
    setModelId: (v: string) => void;
    results: EvaluationResult[];
}

export function ConfigSection({
    systemPrompt,
    setSystemPrompt,
    userInput,
    setUserInput,
    batchSize,
    setBatchSize,
    threshold,
    setThreshold,
    modelId,
    setModelId,
    results
}: ConfigSectionProps) {
    const t = useTranslations("config");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [suggestion, setSuggestion] = useState<{ optimizedPrompt: string; reasoning: string } | null>(null);

    const handleOptimize = async () => {
        if (results.length === 0) return;
        setIsOptimizing(true);
        try {
            const response = await fetch("/api/optimize-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPrompt: systemPrompt, results, modelId }),
            });
            const data = await response.json();
            setSuggestion(data);
        } catch (error) {
            console.error("Failed to optimize prompt", error);
        } finally {
            setIsOptimizing(false);
        }
    };

    const applySuggestion = () => {
        if (suggestion) {
            setSystemPrompt(suggestion.optimizedPrompt);
            setSuggestion(null);
        }
    };

    return (
        <div className="lg:col-span-4 space-y-6">
            <div className="h-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 md:p-8 rounded-3xl backdrop-blur-sm shadow-xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
                <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                    <Filter size={24} className="text-teal-600 dark:text-teal-400" /> {t("title")}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Model</label>
                        <select
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            className="w-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm text-zinc-900 dark:text-zinc-100 transition-all shadow-inner"
                        >
                            {SUPPORTED_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">{t("systemPrompt")}</label>
                            <button
                                onClick={handleOptimize}
                                disabled={isOptimizing || results.length === 0}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500/20 transition-all disabled:opacity-30 disabled:grayscale group"
                                title={results.length === 0 ? "Run evaluation first to optimize" : "Optimize with AI"}
                            >
                                {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:animate-pulse" />}
                                Optimize
                            </button>
                        </div>
                        
                        {suggestion && (
                            <div className="mb-4 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-2xl p-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">AI Suggestion</h4>
                                    <button onClick={() => setSuggestion(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic mb-3">"{suggestion.reasoning}"</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={applySuggestion}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition-all"
                                    >
                                        <Check size={14} /> Apply Suggestion
                                    </button>
                                </div>
                            </div>
                        )}

                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="custom-scrollbar w-full h-32 lg:h-84 bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                            placeholder={t("systemPromptPlaceholder")}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">{t("userInputTemplate")}</label>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full h-24 bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                            placeholder={t("userInputPlaceholder")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">{t("batchSize")}</label>
                            <input
                                type="number"
                                value={batchSize}
                                disabled
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                                className="opacity-50 cursor-not-allowed w-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:ring-offset-zinc-950 text-zinc-900 dark:text-zinc-100 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 whitespace-nowrap">{t("threshold")}</label>
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:ring-offset-zinc-950 text-zinc-900 dark:text-zinc-100 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
