import { Plus, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { TestCase } from "@/types";
import { TestCaseItem } from "./TestCaseItem";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TestCasesSectionProps {
    testCases: TestCase[];
    addTestCase: () => void;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    updateVariable: (id: string, key: string, value: string) => void;
    removeTestCase: (id: string) => void;
    setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
    systemPrompt: string;
    userInputTemplate: string;
}

export function TestCasesSection({
    testCases,
    addTestCase,
    updateTestCase,
    updateVariable,
    removeTestCase,
    setTestCases,
    systemPrompt,
    userInputTemplate
}: TestCasesSectionProps) {
    const t = useTranslations("testCases");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAIGenerate = async () => {
        setIsGenerating(true);
        try {
            // Use the first test case as sample if available
            const sampleInput = testCases.length > 0 ? testCases[0].input : "general input";

            const response = await fetch("/api/generate-test-cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sampleInput, systemPrompt }),
            });
            const data = await response.json();
            if (data.testCases) {
                const newCases = data.testCases.map((tc: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    ...tc
                }));
                setTestCases([...testCases, ...newCases]);
            }
        } catch (error) {
            console.error("Failed to generate test cases", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="lg:col-span-8 space-y-8 h-full">
            <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all duration-500 min-h-[500px]">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 via-purple-500 to-transparent opacity-50" />
                
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                    <div className="space-y-1">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-blue-500" /> Test Scenario Lab
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 italic">Active Suite</span>
                             <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-0.5 rounded-full text-[10px] font-black shadow-lg">
                                {testCases.length} CASES
                            </span>
                        </div>
                    </div>

                    <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 group border border-zinc-800 dark:border-zinc-200"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-teal-500 group-hover:rotate-12 transition-transform" />}
                            {isGenerating ? "Synthesizing..." : "AI Generate Cases"}
                        </button>
                        <button
                            onClick={addTestCase}
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700 shadow-xl"
                        >
                            <Plus size={16} /> {t("addTestCase")}
                        </button>
                    </div>
                </div>

                <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar pb-8">
                    {testCases.map((tc, index) => (
                        <div key={tc.id} className="animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                            <TestCaseItem
                                tc={tc}
                                index={index}
                                updateTestCase={updateTestCase}
                                updateVariable={updateVariable}
                                removeTestCase={removeTestCase}
                                systemPrompt={systemPrompt}
                                userInputTemplate={userInputTemplate}
                            />
                        </div>
                    ))}

                    {testCases.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] opacity-40">
                            <Plus size={40} className="mb-4 text-zinc-400" />
                            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Suite is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
