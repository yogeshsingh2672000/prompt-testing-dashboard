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
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="h-full bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Filter size={18} className="text-teal-400" /> Configuration
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">System Prompt</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="custom-scrollbar w-full h-32 lg:h-84 bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                            placeholder="Enter instructions for the AI..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">User Input Template</label>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
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
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ring-offset-zinc-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Threshold(Pass/Fail) %</label>
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ring-offset-zinc-950"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
