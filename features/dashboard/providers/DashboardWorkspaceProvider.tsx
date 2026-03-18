"use client";

import { createContext, useContext, useState } from "react";
import { useEvaluation } from "@/features/evaluation/hooks/useEvaluation";
import {
    DEFAULT_BATCH_SIZE,
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_THRESHOLD,
    DEFAULT_USER_INPUT,
    INITIAL_TEST_CASES,
} from "@/shared/constants/defaults";
import { DEFAULT_MODEL_ID } from "@/shared/constants/models";
import { TestRun } from "@/shared/lib/persistence";
import { TestCase } from "@/shared/types";
import { ToastItem } from "@/shared/ui/ToastViewport";

interface DashboardWorkspaceContextValue {
    systemPrompt: string;
    setSystemPrompt: (value: string) => void;
    userInput: string;
    setUserInput: (value: string) => void;
    testCases: TestCase[];
    setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
    batchSize: number;
    setBatchSize: (value: number) => void;
    threshold: number;
    setThreshold: (value: number) => void;
    modelId: string;
    setModelId: (value: string) => void;
    results: ReturnType<typeof useEvaluation>["results"];
    loading: boolean;
    error: string | null;
    activeRunId?: string;
    toasts: ToastItem[];
    dismissToast: (id: string) => void;
    pushToast: (toast: Omit<ToastItem, "id">) => void;
    runEvaluation: () => Promise<void>;
    addTestCase: () => void;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    updateVariable: (id: string, key: string, value: string) => void;
    removeTestCase: (id: string) => void;
    loadRun: (run: TestRun) => void;
}

const DashboardWorkspaceContext = createContext<DashboardWorkspaceContextValue | null>(null);

export function DashboardWorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
    const [userInput, setUserInput] = useState(DEFAULT_USER_INPUT);
    const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
    const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
    const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
    const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
    const [activeRunId, setActiveRunId] = useState<string | undefined>();
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

    const { results, loading, error, runEvaluation, setResults, setError } = useEvaluation(
        testCases,
        systemPrompt,
        userInput,
        batchSize,
        threshold,
        modelId,
        (message) => pushToast({ title: "Evaluation failed", message, variant: "error" })
    );

    const addTestCase = () => {
        setTestCases((current) => [...current, { id: crypto.randomUUID(), input: "", expectedOutput: "" }]);
    };

    const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
        setTestCases((current) => current.map((testCase) => (testCase.id === id ? { ...testCase, [field]: value } : testCase)));
    };

    const updateVariable = (id: string, key: string, value: string) => {
        setTestCases((current) =>
            current.map((testCase) =>
                testCase.id === id
                    ? { ...testCase, variables: { ...(testCase.variables || {}), [key]: value } }
                    : testCase
            )
        );
    };

    const removeTestCase = (id: string) => {
        setTestCases((current) => current.filter((testCase) => testCase.id !== id));
    };

    const loadRun = (run: TestRun) => {
        setActiveRunId(run.id);
        setSystemPrompt(run.systemPrompt);
        setUserInput(run.userInput);
        setTestCases(run.testCases || []);
        setBatchSize(run.config.batchSize);
        setThreshold(run.config.threshold);
        setModelId(run.config.modelId || DEFAULT_MODEL_ID);
        setResults(run.results);
        setError(null);
    };

    return (
        <DashboardWorkspaceContext.Provider
            value={{
                systemPrompt,
                setSystemPrompt,
                userInput,
                setUserInput,
                testCases,
                setTestCases,
                batchSize,
                setBatchSize,
                threshold,
                setThreshold,
                modelId,
                setModelId,
                results,
                loading,
                error,
                activeRunId,
                toasts,
                dismissToast,
                pushToast,
                runEvaluation,
                addTestCase,
                updateTestCase,
                updateVariable,
                removeTestCase,
                loadRun,
            }}
        >
            {children}
        </DashboardWorkspaceContext.Provider>
    );
}

export function useDashboardWorkspace() {
    const context = useContext(DashboardWorkspaceContext);

    if (!context) {
        throw new Error("useDashboardWorkspace must be used within DashboardWorkspaceProvider");
    }

    return context;
}
