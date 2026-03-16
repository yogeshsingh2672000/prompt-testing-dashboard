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
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 md:p-8 rounded-3xl backdrop-blur-xl min-h-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl relative overflow-hidden group transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                        <CheckCircle2 size={24} className="text-blue-600 dark:text-blue-400" /> {t("title")}
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700">
                            {testCases.length}
                        </span>
                    </h2>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                            className="w-full sm:w-auto text-teal-600 dark:text-teal-400 transition-all flex items-center justify-center gap-2 text-sm font-black bg-teal-500/10 hover:bg-teal-500/20 px-5 py-2.5 rounded-xl border border-teal-500/30 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isGenerating ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Sparkles size={18} className="group-hover:animate-pulse" />
                            )}
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </button>
                        <button
                            onClick={addTestCase}
                            className="w-full sm:w-auto text-zinc-900 dark:text-zinc-100 transition-all flex items-center justify-center gap-2 text-sm font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg active:scale-95"
                        >
                            <Plus size={18} /> {t("addTestCase")}
                        </button>
                    </div>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {testCases.map((tc, index) => (
                        <TestCaseItem
                            key={tc.id}
                            tc={tc}
                            index={index}
                            updateTestCase={updateTestCase}
                            updateVariable={updateVariable}
                            removeTestCase={removeTestCase}
                            systemPrompt={systemPrompt}
                            userInputTemplate={userInputTemplate}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
