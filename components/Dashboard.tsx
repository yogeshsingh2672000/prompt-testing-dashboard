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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8 selection:bg-teal-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-md shadow-2xl">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                            Prompt Evaluation Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-2 font-medium">Test and score your prompts with AWS Bedrock.</p>
                    </div>
                    <button
                        onClick={runEvaluation}
                        disabled={loading}
                        className="cursor-pointer group relative flex items-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-900"></div> : <Play size={20} className="fill-current" />}
                        <span className="relative z-10">{loading ? "Evaluating..." : "Run Evaluation"}</span>
                    </button>
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
