"use client";

import { Filter } from "lucide-react";

interface ConfigSectionProps {
    systemPrompt: string;
    setSystemPrompt: (v: string) => void;
    userInput: string;
    setUserInput: (v: string) => void;
    batchSize: number;
    setBatchSize: (v: number) => void;
    threshold: number;
    setThreshold: (v: number) => void;
}

export function ConfigSection({
    systemPrompt,
    setSystemPrompt,
    userInput,
    setUserInput,
    batchSize,
    setBatchSize,
    threshold,
    setThreshold
}: ConfigSectionProps) {
    return (
        <div className="lg:col-span-4 space-y-6">
            <div className="h-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 md:p-8 rounded-3xl backdrop-blur-sm shadow-xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
                <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                    <Filter size={24} className="text-teal-600 dark:text-teal-400" /> Configuration
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">System Prompt</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="custom-scrollbar w-full h-32 lg:h-84 bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                            placeholder="Enter instructions for the AI..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">User Input Template</label>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full h-24 bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                            placeholder="Input template (e.g. Generate a response based on the context...)"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Batch Size</label>
                            <input
                                type="number"
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                                className="w-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:ring-offset-zinc-950 text-zinc-900 dark:text-zinc-100 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Threshold(Pass/Fail) %</label>
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
