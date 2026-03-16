"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { TestCase } from "@/types";
import { INITIAL_TEST_CASES, DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_INPUT, DEFAULT_BATCH_SIZE, DEFAULT_THRESHOLD } from "@/constants/defaults";
import { useEvaluation } from "@/hooks/useEvaluation";

// Modular Components
import { ConfigSection } from "./dashboard/ConfigSection";
import { TestCasesSection } from "./dashboard/TestCasesSection";
import { ResultsSection } from "./dashboard/ResultsSection";
import { ThemeToggle } from "./ui/ThemeToggle";

export default function Dashboard() {
    // 1. Initial State
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
    const [userInput, setUserInput] = useState(DEFAULT_USER_INPUT);
    const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
    const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
    const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

    // 2. Evaluation Logic Hook
    const { results, loading, runEvaluation } = useEvaluation(
        testCases,
        systemPrompt,
        userInput,
        batchSize,
        threshold
    );

    // 3. Handlers
    const addTestCase = () => {
        setTestCases([...testCases, { id: Math.random().toString(36).substr(2, 9), input: "", expectedOutput: "" }]);
    };

    const removeTestCase = (id: string) => {
        setTestCases(testCases.filter((tc) => tc.id !== id));
    };

    const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
        setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans p-4 md:p-8 selection:bg-teal-500/30 transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 dark:bg-zinc-900/40 p-5 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none" />
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-teal-600 via-blue-600 to-purple-700 dark:from-teal-400 dark:via-blue-500 dark:to-purple-600 bg-clip-text text-transparent">
                            Promitly
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-2 font-semibold text-sm md:text-lg tracking-tight">
                            Precision Engineering for Bedrock AI.
                            <span className="hidden md:inline text-zinc-400 dark:text-zinc-500 font-medium ml-2">— Evaluate, refine, and optimize with semantic intelligence.</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <ThemeToggle />
                        <button
                            onClick={runEvaluation}
                            disabled={loading}
                            className="flex-1 md:flex-none group relative flex items-center justify-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-900"></div> : <Play size={20} className="fill-current" />}
                            <span className="relative z-10 text-lg">{loading ? "Evaluating..." : "Run Evaluation"}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
                    {/* Config Area */}
                    <ConfigSection
                        systemPrompt={systemPrompt}
                        setSystemPrompt={setSystemPrompt}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        batchSize={batchSize}
                        setBatchSize={setBatchSize}
                        threshold={threshold}
                        setThreshold={setThreshold}
                    />

                    {/* Test Case Management */}
                    <TestCasesSection
                        testCases={testCases}
                        addTestCase={addTestCase}
                        updateTestCase={updateTestCase}
                        removeTestCase={removeTestCase}
                    />
                </div>

                {/* Evaluation Feedback */}
                <ResultsSection
                    results={results}
                    loading={loading}
                    testCases={testCases}
                />
            </div>
        </div>
    );
}
