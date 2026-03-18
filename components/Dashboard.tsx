"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { TestCase } from "@/types";
import { INITIAL_TEST_CASES, DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_INPUT, DEFAULT_BATCH_SIZE, DEFAULT_THRESHOLD } from "@/constants/defaults";
import { useEvaluation } from "@/hooks/useEvaluation";

// Modular Components
import { ConfigSection } from "./dashboard/ConfigSection";
import { TestCasesSection } from "./dashboard/TestCasesSection";
import { ResultsSection } from "./dashboard/ResultsSection";
import { HistorySection } from "./dashboard/HistorySection";
import { AnalyticsSection } from "./dashboard/AnalyticsSection";
import { ThemeToggle } from "./ui/ThemeToggle";
import { LanguageToggle } from "./ui/LanguageToggle";
import { ToastItem, ToastViewport } from "./ui/ToastViewport";
import { TestRun } from "@/lib/persistence";

import { useTranslations } from "next-intl";

import { DEFAULT_MODEL_ID } from "@/constants/models";

export default function Dashboard() {
    const t = useTranslations("common");
    
    // 1. Initial State
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
    const [userInput, setUserInput] = useState(DEFAULT_USER_INPUT);
    const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
    const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
    const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
    const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
    const [activeRunId, setActiveRunId] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<'design' | 'results' | 'history'>('design');
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const pushToast = (toast: Omit<ToastItem, "id">) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, ...toast }]);

        window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== id));
        }, 5000);
    };

    const dismissToast = (id: string) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    };

    // 2. Evaluation Logic Hook
    const { results, loading, error, runEvaluation: executeEvaluation, setResults, setError } = useEvaluation(
        testCases,
        systemPrompt,
        userInput,
        batchSize,
        threshold,
        modelId,
        (message) => pushToast({ title: "Evaluation failed", message, variant: "error" })
    );

    const runEvaluation = async () => {
        setActiveTab('results');
        await executeEvaluation();
    };

    // 3. Handlers
    const handleLoadRun = (run: TestRun) => {
        setActiveRunId(run.id);
        setSystemPrompt(run.systemPrompt);
        setUserInput(run.userInput);
        setTestCases(run.testCases || []);
        setBatchSize(run.config.batchSize);
        setThreshold(run.config.threshold);
        setModelId(run.config.modelId || DEFAULT_MODEL_ID);
        setResults(run.results);
        setError(null);
        setActiveTab('results');
    };

    const addTestCase = () => {
        setTestCases([...testCases, { id: Math.random().toString(36).substr(2, 9), input: "", expectedOutput: "" }]);
    };

    const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
        setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
    };

    const updateVariable = (id: string, key: string, value: string) => {
        setTestCases(testCases.map(tc => tc.id === id ? { 
            ...tc, 
            variables: { ...(tc.variables || {}), [key]: value } 
        } : tc));
    };

    const removeTestCase = (id: string) => {
        setTestCases(testCases.filter(tc => tc.id !== id));
    };

    return (
        <div className="min-h-screen bg-transparent relative">
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
            <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-4">
                            <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-1 rounded-2xl rotate-[-2deg] shadow-2xl">PROMITLY</span>
                            <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">/</span>
                            <span className="opacity-50 hidden sm:inline">DASHBOARD</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium ml-1 text-sm md:text-base">
                            The Complete Prompt Engineering Workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LanguageToggle />
                        <button
                            onClick={runEvaluation}
                            disabled={loading}
                            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 min-w-[180px] px-8 py-4 rounded-3xl font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(255,255,255,0.05)] disabled:opacity-50 group border border-zinc-800 dark:border-zinc-200"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={22} fill="currentColor" />}
                            {loading ? t("evaluating") : t("runTest")}
                        </button>
                    </div>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full sm:w-fit backdrop-blur-xl">
                    <button
                        onClick={() => setActiveTab('design')}
                        className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${activeTab === 'design' ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        1. Design
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${activeTab === 'results' ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        2. Evaluate
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${activeTab === 'history' ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        3. History
                    </button>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'design' && (
                        <div className="flex flex-col gap-8 text-sm xl:flex-row xl:items-stretch">
                            {/* Config Area */}
                            <ConfigSection
                                systemPrompt={systemPrompt}
                                setSystemPrompt={setSystemPrompt}
                                userInput={userInput}
                                setUserInput={setUserInput}
                                batchSize={batchSize}
                                threshold={threshold}
                                setThreshold={setThreshold}
                                modelId={modelId}
                                setModelId={setModelId}
                                results={results}
                                onError={(message) => pushToast({ title: "Optimization failed", message, variant: "error" })}
                            />

                            {/* Test Case Management */}
                            <TestCasesSection
                                testCases={testCases}
                                addTestCase={addTestCase}
                                updateTestCase={updateTestCase}
                                updateVariable={updateVariable}
                                removeTestCase={removeTestCase}
                                setTestCases={setTestCases}
                                systemPrompt={systemPrompt}
                                userInputTemplate={userInput}
                                onError={(message) => pushToast({ title: "Case generation failed", message, variant: "error" })}
                            />
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="flex flex-col gap-8">
                            {/* Analytics Header (only if results exist) */}
                            {results.length > 0 && !loading && (
                                <AnalyticsSection results={results} />
                            )}

                            {/* Results Table */}
                            <ResultsSection
                                results={results}
                                loading={loading}
                                testCases={testCases}
                                error={error}
                            />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <HistorySection 
                            onLoadRun={handleLoadRun} 
                            activeRunId={activeRunId} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
