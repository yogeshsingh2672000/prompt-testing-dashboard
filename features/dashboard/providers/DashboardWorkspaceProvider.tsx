"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useEvaluation } from "@/features/evaluation/hooks/useEvaluation";
import {
    DEFAULT_BATCH_SIZE,
    DEFAULT_RUBRICS,
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_THRESHOLD,
    DEFAULT_USER_INPUT,
    INITIAL_TEST_CASES,
    RUBRIC_PRESETS,
} from "@/shared/constants/defaults";
import { DEFAULT_MODEL_ID } from "@/shared/constants/models";
import { AppSettings, persistence, PromptVersion, TestCaseSuite, TestRun } from "@/shared/lib/persistence";
import { OutputValidationType, RubricDefinition, TestCase } from "@/shared/types";
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
    rubrics: RubricDefinition[];
    setRubrics: React.Dispatch<React.SetStateAction<RubricDefinition[]>>;
    updateRubric: (id: string, updates: Partial<RubricDefinition>) => void;
    settings: AppSettings;
    saveSettings: (settings: AppSettings) => Promise<void>;
    resetSettings: () => Promise<void>;
    applySettingsToWorkspace: (settings?: AppSettings) => void;
    modelId: string;
    setModelId: (value: string) => void;
    results: ReturnType<typeof useEvaluation>["results"];
    loading: boolean;
    error: string | null;
    activeRunId?: string;
    suites: TestCaseSuite[];
    promptVersions: PromptVersion[];
    activeSuiteId?: string;
    activePromptVersionId?: string;
    toasts: ToastItem[];
    dismissToast: (id: string) => void;
    pushToast: (toast: Omit<ToastItem, "id">) => void;
    runEvaluation: () => Promise<void>;
    addTestCase: () => void;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    updateVariable: (id: string, key: string, value: string) => void;
    updateOutputValidation: (id: string, type: OutputValidationType, value?: string) => void;
    removeTestCase: (id: string) => void;
    loadRun: (run: TestRun) => void;
    saveCurrentSuite: (name: string) => Promise<void>;
    importSuites: (suitesToImport: TestCaseSuite[]) => Promise<number>;
    loadSuite: (suite: TestCaseSuite) => void;
    deleteSuite: (id: string) => Promise<void>;
    savePromptVersion: (name: string) => Promise<void>;
    loadPromptVersion: (version: PromptVersion) => void;
    deletePromptVersion: (id: string) => Promise<void>;
    refreshAssets: () => Promise<void>;
}

const DashboardWorkspaceContext = createContext<DashboardWorkspaceContextValue | null>(null);

function createDefaultAppSettings(): AppSettings {
    return {
        id: "app_settings",
        defaultModelId: DEFAULT_MODEL_ID,
        defaultBatchSize: DEFAULT_BATCH_SIZE,
        defaultThreshold: DEFAULT_THRESHOLD,
        defaultRubrics: DEFAULT_RUBRICS.map((rubric) => ({ ...rubric })),
        rubricPresetId: RUBRIC_PRESETS[0].id,
        updatedAt: Date.now(),
    };
}

export function DashboardWorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
    const [userInput, setUserInput] = useState(DEFAULT_USER_INPUT);
    const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
    const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
    const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
    const [rubrics, setRubrics] = useState<RubricDefinition[]>(DEFAULT_RUBRICS);
    const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
    const [settings, setSettings] = useState<AppSettings>(() => createDefaultAppSettings());
    const [activeRunId, setActiveRunId] = useState<string | undefined>();
    const [activeSuiteId, setActiveSuiteId] = useState<string | undefined>();
    const [activePromptVersionId, setActivePromptVersionId] = useState<string | undefined>();
    const [suites, setSuites] = useState<TestCaseSuite[]>([]);
    const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
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

    const refreshAssets = async () => {
        const [savedSuites, savedPromptVersions, savedSettings] = await Promise.all([
            persistence.getSuites(),
            persistence.getPromptVersions(),
            persistence.getSettings(),
        ]);

        setSuites(savedSuites.sort((a, b) => b.updatedAt - a.updatedAt));
        setPromptVersions(savedPromptVersions.sort((a, b) => b.createdAt - a.createdAt));
        if (savedSettings) {
            setSettings(savedSettings);
            setBatchSize(savedSettings.defaultBatchSize);
            setThreshold(savedSettings.defaultThreshold);
            setRubrics(savedSettings.defaultRubrics);
            setModelId(savedSettings.defaultModelId || DEFAULT_MODEL_ID);
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void refreshAssets();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const { results, loading, error, runEvaluation, setResults, setError } = useEvaluation(
        testCases,
        systemPrompt,
        userInput,
        batchSize,
        threshold,
        modelId,
        rubrics,
        (message) => pushToast({ title: "Evaluation failed", message, variant: "error" })
    );

    const updateRubric = (id: string, updates: Partial<RubricDefinition>) => {
        setRubrics((current) => current.map((rubric) => (rubric.id === id ? { ...rubric, ...updates } : rubric)));
    };

    const applySettingsToWorkspace = (nextSettings: AppSettings = settings) => {
        setBatchSize(nextSettings.defaultBatchSize);
        setThreshold(nextSettings.defaultThreshold);
        setRubrics(nextSettings.defaultRubrics);
        setModelId(nextSettings.defaultModelId || DEFAULT_MODEL_ID);
    };

    const saveSettings = async (nextSettings: AppSettings) => {
        await persistence.saveSettings(nextSettings);
        setSettings(nextSettings);
    };

    const resetSettings = async () => {
        await persistence.clearSettings();
        const defaultSettings = createDefaultAppSettings();
        setSettings(defaultSettings);
        applySettingsToWorkspace(defaultSettings);
    };

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

    const updateOutputValidation = (id: string, type: OutputValidationType, value?: string) => {
        setTestCases((current) =>
            current.map((testCase) => {
                if (testCase.id !== id) {
                    return testCase;
                }

                if (type === "none") {
                    return { ...testCase, outputValidation: { type: "none" } };
                }

                return {
                    ...testCase,
                    outputValidation: {
                        type,
                        value: value ?? "",
                    },
                };
            })
        );
    };

    const removeTestCase = (id: string) => {
        setTestCases((current) => current.filter((testCase) => testCase.id !== id));
    };

    const loadRun = (run: TestRun) => {
        setActiveRunId(run.id);
        setActiveSuiteId(run.suiteId);
        setSystemPrompt(run.systemPrompt);
        setUserInput(run.userInput);
        setTestCases(run.testCases || []);
        setBatchSize(run.config.batchSize);
        setThreshold(run.config.threshold);
        setRubrics(run.config.rubrics || DEFAULT_RUBRICS);
        setModelId(run.config.modelId || DEFAULT_MODEL_ID);
        setResults(run.results);
        setError(null);
    };

    const saveCurrentSuite = async (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error("Suite name is required");
        }

        const timestamp = Date.now();
        const suite: TestCaseSuite = {
            id: activeSuiteId || crypto.randomUUID(),
            name: trimmedName,
            systemPrompt,
            userInput,
            testCases,
            rubrics,
            versionCount: promptVersions.filter((version) => version.suiteId === activeSuiteId).length,
            createdAt: suites.find((suiteItem) => suiteItem.id === activeSuiteId)?.createdAt || timestamp,
            updatedAt: timestamp,
        };

        await persistence.saveSuite(suite);
        setActiveSuiteId(suite.id);
        await refreshAssets();
        pushToast({ title: "Suite saved", message: `"${suite.name}" is ready to reuse.`, variant: "success" });
    };

    const loadSuite = (suite: TestCaseSuite) => {
        setActiveSuiteId(suite.id);
        setSystemPrompt(suite.systemPrompt);
        setUserInput(suite.userInput);
        setTestCases(suite.testCases);
        setRubrics(suite.rubrics || DEFAULT_RUBRICS);
        setResults([]);
        setError(null);
        pushToast({ title: "Suite loaded", message: `"${suite.name}" has been loaded into the workspace.`, variant: "success" });
    };

    const importSuites = async (suitesToImport: TestCaseSuite[]) => {
        for (const suite of suitesToImport) {
            await persistence.saveSuite(suite);
        }

        await refreshAssets();
        return suitesToImport.length;
    };

    const deleteSuiteRecord = async (id: string) => {
        await persistence.deleteSuite(id);
        if (activeSuiteId === id) {
            setActiveSuiteId(undefined);
        }
        await refreshAssets();
    };

    const savePromptVersion = async (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error("Version name is required");
        }

        const version: PromptVersion = {
            id: crypto.randomUUID(),
            name: trimmedName,
            systemPrompt,
            userInput,
            testCases,
            rubrics,
            modelId,
            threshold,
            batchSize,
            suiteId: activeSuiteId,
            createdAt: Date.now(),
        };

        await persistence.savePromptVersion(version);
        setActivePromptVersionId(version.id);
        await refreshAssets();
        pushToast({ title: "Prompt version saved", message: `"${version.name}" is now available for comparison.`, variant: "success" });
    };

    const loadPromptVersion = (version: PromptVersion) => {
        setActivePromptVersionId(version.id);
        setActiveSuiteId(version.suiteId);
        setSystemPrompt(version.systemPrompt);
        setUserInput(version.userInput);
        setTestCases(version.testCases);
        setRubrics(version.rubrics || DEFAULT_RUBRICS);
        setModelId(version.modelId || DEFAULT_MODEL_ID);
        setThreshold(version.threshold);
        setBatchSize(version.batchSize);
        setResults([]);
        setError(null);
        pushToast({ title: "Prompt version loaded", message: `"${version.name}" is now active in the workspace.`, variant: "success" });
    };

    const deletePromptVersionRecord = async (id: string) => {
        await persistence.deletePromptVersion(id);
        if (activePromptVersionId === id) {
            setActivePromptVersionId(undefined);
        }
        await refreshAssets();
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
                rubrics,
                setRubrics,
                updateRubric,
                settings,
                saveSettings,
                resetSettings,
                applySettingsToWorkspace,
                modelId,
                setModelId,
                results,
                loading,
                error,
                activeRunId,
                suites,
                promptVersions,
                activeSuiteId,
                activePromptVersionId,
                toasts,
                dismissToast,
                pushToast,
                runEvaluation,
                addTestCase,
                updateTestCase,
                updateVariable,
                updateOutputValidation,
                removeTestCase,
                loadRun,
                saveCurrentSuite,
                importSuites,
                loadSuite,
                deleteSuite: deleteSuiteRecord,
                savePromptVersion,
                loadPromptVersion,
                deletePromptVersion: deletePromptVersionRecord,
                refreshAssets,
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
