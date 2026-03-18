import { Sparkles, Wand2, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SUPPORTED_MODELS } from "@/constants/models";
import { useState } from "react";
import { EvaluationResult, PromptOptimizationSuggestion } from "@/types";

interface ConfigSectionProps {
    systemPrompt: string;
    setSystemPrompt: (v: string) => void;
    userInput: string;
    setUserInput: (v: string) => void;
    batchSize: number;
    threshold: number;
    setThreshold: (v: number) => void;
    modelId: string;
    setModelId: (v: string) => void;
    results: EvaluationResult[];
    onError?: (message: string) => void;
}

export function ConfigSection({
    systemPrompt,
    setSystemPrompt,
    userInput,
    setUserInput,
    batchSize,
    threshold,
    setThreshold,
    modelId,
    setModelId,
    results,
    onError
}: ConfigSectionProps) {
    const t = useTranslations("config");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [suggestion, setSuggestion] = useState<PromptOptimizationSuggestion | null>(null);

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
            if (!response.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "Failed to optimize prompt");
            }
            setSuggestion(data);
        } catch (error) {
            console.error("Failed to optimize prompt", error);
            onError?.(error instanceof Error ? error.message : "Failed to optimize prompt");
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
        <div className="w-full xl:w-[28rem] xl:min-w-[24rem] xl:max-w-[32rem] space-y-8">
            <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all duration-500 h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-transparent opacity-50" />
                
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-10 flex items-center gap-3">
                    <Wand2 size={16} className="text-teal-500" /> {t("workspaceConfig")}
                </h2>

                <div className="space-y-10">
                    {/* section: Engine */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1 italic">1. {t("engineConfiguration")}</label>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 ml-1">{t("aiModelProvider")}</label>
                                <select
                                    value={modelId}
                                    onChange={(e) => setModelId(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm text-zinc-900 dark:text-zinc-100 transition-all font-medium"
                                >
                                    {SUPPORTED_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 ml-1">{t("batchSize")}</label>
                                    <input
                                        type="number"
                                        value={batchSize}
                                        disabled
                                        className="opacity-50 cursor-not-allowed w-full bg-zinc-900/5 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 ml-1">{t("passThreshold")}</label>
                                    <input
                                        type="number"
                                        value={threshold}
                                        onChange={(e) => setThreshold(Number(e.target.value))}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* section: Prompts */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest italic">2. {t("promptBlueprints")}</label>
                            <button
                                onClick={handleOptimize}
                                disabled={isOptimizing || results.length === 0}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale group shadow-xl"
                            >
                                {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />}
                                {t("aiOptimize")}
                            </button>
                        </div>

                        {suggestion && (
                            <div className="relative bg-zinc-900 dark:bg-white p-6 rounded-[2rem] border border-zinc-800 dark:border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-300">
                                <button onClick={() => setSuggestion(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">{t("suggestionReady")}</span>
                                </div>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-4 pr-6 leading-relaxed">
                                    &quot;{suggestion.reasoning}&quot;
                                </p>
                                <button 
                                    onClick={applySuggestion}
                                    className="w-full py-3 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
                                >
                                    {t("applyOptimization")}
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 ml-1">{t("systemInstructions")}</label>
                                <textarea
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    className="custom-scrollbar w-full h-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium leading-relaxed"
                                    placeholder="Enter system prompt instructions..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 ml-1">{t("userInputBlueprint")}</label>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="custom-scrollbar w-full h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium leading-relaxed"
                                    placeholder="e.g. Please analyze this text: {{input}}"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
