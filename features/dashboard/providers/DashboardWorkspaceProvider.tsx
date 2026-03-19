"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
import { buildTestRun } from "@/shared/lib/run-records";
import { resolveBaselinePromptVersionId } from "@/shared/lib/run-analytics";
import { getNextRunAt, isScheduleDue } from "@/shared/lib/schedule-utils";
import { AppSettings, persistence, PromptVersion, ScheduledEvaluation, TestCaseSuite, TestRun } from "@/shared/lib/persistence";
import { ConversationTurnRole, EvaluationRequest, EvaluationResult, OutputValidationType, RubricDefinition, TestCase } from "@/shared/types";
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
    setGlobalBaselinePromptVersionId: (versionId?: string) => Promise<void>;
    setSuiteBaselinePromptVersionId: (suiteId: string, versionId?: string) => Promise<void>;
    modelId: string;
    setModelId: (value: string) => void;
    results: ReturnType<typeof useEvaluation>["results"];
    loading: boolean;
    error: string | null;
    activeRunId?: string;
    suites: TestCaseSuite[];
    promptVersions: PromptVersion[];
    schedules: ScheduledEvaluation[];
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
    addConversationTurn: (id: string, role?: ConversationTurnRole) => void;
    updateConversationTurn: (id: string, turnId: string, field: "role" | "content", value: string) => void;
    removeConversationTurn: (id: string, turnId: string) => void;
    removeTestCase: (id: string) => void;
    loadRun: (run: TestRun) => void;
    saveCurrentSuite: (name: string) => Promise<void>;
    importSuites: (suitesToImport: TestCaseSuite[]) => Promise<number>;
    loadSuite: (suite: TestCaseSuite) => void;
    deleteSuite: (id: string) => Promise<void>;
    savePromptVersion: (name: string) => Promise<void>;
    loadPromptVersion: (version: PromptVersion) => void;
    deletePromptVersion: (id: string) => Promise<void>;
    saveSchedule: (schedule: ScheduledEvaluation) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    runScheduleNow: (id: string) => Promise<void>;
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
        baselinePromptVersionIdsBySuite: {},
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
    const [schedules, setSchedules] = useState<ScheduledEvaluation[]>([]);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const runningScheduleIds = useRef<Set<string>>(new Set());

    const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, ...toast }]);

        window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== id));
        }, 5000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    }, []);

    const refreshAssets = useCallback(async () => {
        const [savedSuites, savedPromptVersions, savedSettings, savedSchedules] = await Promise.all([
            persistence.getSuites(),
            persistence.getPromptVersions(),
            persistence.getSettings(),
            persistence.getSchedules(),
        ]);

        setSuites(savedSuites.sort((a, b) => b.updatedAt - a.updatedAt));
        setPromptVersions(savedPromptVersions.sort((a, b) => b.createdAt - a.createdAt));
        setSchedules(savedSchedules.sort((a, b) => b.updatedAt - a.updatedAt));
        if (savedSettings) {
            const normalizedSettings: AppSettings = {
                ...savedSettings,
                baselinePromptVersionIdsBySuite: savedSettings.baselinePromptVersionIdsBySuite || {},
            };
            setSettings(normalizedSettings);
            setBatchSize(normalizedSettings.defaultBatchSize);
            setThreshold(normalizedSettings.defaultThreshold);
            setRubrics(normalizedSettings.defaultRubrics);
            setModelId(normalizedSettings.defaultModelId || DEFAULT_MODEL_ID);
        }
    }, []);

    const executeSchedule = useCallback(async (schedule: ScheduledEvaluation, source: "schedule" | "api" = "schedule") => {
        if (runningScheduleIds.current.has(schedule.id)) {
            return;
        }

        const promptVersion = promptVersions.find((version) => version.id === schedule.promptVersionId);
        const suite = schedule.suiteId ? suites.find((entry) => entry.id === schedule.suiteId) : undefined;

        if (!promptVersion) {
            throw new Error("Scheduled evaluation is missing a prompt version.");
        }

        const testCases = suite?.testCases || promptVersion.testCases;
        if (!testCases || testCases.length === 0) {
            throw new Error("Scheduled evaluation does not have any test cases.");
        }

        runningScheduleIds.current.add(schedule.id);
        try {
            const payload: EvaluationRequest = {
                systemPrompt: promptVersion.systemPrompt,
                userInput: promptVersion.userInput,
                testCases,
                batchSize: schedule.batchSize,
                threshold: schedule.threshold,
                modelId: schedule.modelId || promptVersion.modelId,
                rubrics: schedule.rubrics,
            };

            const response = await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "Scheduled evaluation failed");
            }

            const results = data as EvaluationResult[];
            const baselinePromptVersionId = resolveBaselinePromptVersionId(
                suite?.id,
                promptVersions,
                settings.globalBaselinePromptVersionId,
                settings.baselinePromptVersionIdsBySuite
            );

            const run = buildTestRun({
                name: `${schedule.name} - ${new Date().toLocaleString()}`,
                systemPrompt: promptVersion.systemPrompt,
                userInput: promptVersion.userInput,
                testCases,
                results,
                batchSize: schedule.batchSize,
                threshold: schedule.threshold,
                modelId: schedule.modelId || promptVersion.modelId,
                rubrics: schedule.rubrics,
                suiteId: suite?.id || promptVersion.suiteId,
                promptVersionId: promptVersion.id,
                scheduleId: schedule.id,
                triggerSource: source,
                baselinePromptVersionId,
                metadata: {
                    suiteName: suite?.name,
                    promptVersionName: promptVersion.name,
                },
            });

            await persistence.saveRun(run);

            const now = Date.now();
            await persistence.saveSchedule({
                ...schedule,
                lastRunAt: now,
                nextRunAt: getNextRunAt(now, schedule.cadenceHours),
                updatedAt: now,
            });

            window.dispatchEvent(new CustomEvent("promitly:runs-updated"));
            await refreshAssets();
        } finally {
            runningScheduleIds.current.delete(schedule.id);
        }
    }, [promptVersions, refreshAssets, settings, suites]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void refreshAssets();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [refreshAssets]);

    useEffect(() => {
        const checkDueSchedules = () => {
            const dueSchedules = schedules.filter((schedule) => isScheduleDue(schedule));
            dueSchedules.forEach((schedule) => {
                void executeSchedule(schedule).catch((error) => {
                    pushToast({
                        title: "Scheduled run failed",
                        message: error instanceof Error ? error.message : "Unable to complete scheduled evaluation.",
                        variant: "error",
                    });
                });
            });
        };

        checkDueSchedules();
        const intervalId = window.setInterval(() => {
            checkDueSchedules();
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, [executeSchedule, pushToast, schedules]);

    const { results, loading, error, runEvaluation, setResults, setError } = useEvaluation(
        testCases,
        systemPrompt,
        userInput,
        batchSize,
        threshold,
        modelId,
        rubrics,
        (message) => pushToast({ title: "Evaluation failed", message, variant: "error" }),
        {
            suiteId: activeSuiteId,
            promptVersionId: activePromptVersionId,
            baselinePromptVersionId: resolveBaselinePromptVersionId(
                activeSuiteId,
                promptVersions,
                settings.globalBaselinePromptVersionId,
                settings.baselinePromptVersionIdsBySuite
            ),
            metadata: {
                suiteName: suites.find((suite) => suite.id === activeSuiteId)?.name,
                promptVersionName: promptVersions.find((version) => version.id === activePromptVersionId)?.name,
            },
        }
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

    const setGlobalBaselinePromptVersionId = async (versionId?: string) => {
        const nextSettings: AppSettings = {
            ...settings,
            globalBaselinePromptVersionId: versionId,
            updatedAt: Date.now(),
        };
        await saveSettings(nextSettings);
    };

    const setSuiteBaselinePromptVersionId = async (suiteId: string, versionId?: string) => {
        const nextMap = { ...settings.baselinePromptVersionIdsBySuite };
        if (versionId) {
            nextMap[suiteId] = versionId;
        } else {
            delete nextMap[suiteId];
        }
        const nextSettings: AppSettings = {
            ...settings,
            baselinePromptVersionIdsBySuite: nextMap,
            updatedAt: Date.now(),
        };
        await saveSettings(nextSettings);
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

    const addConversationTurn = (id: string, role: ConversationTurnRole = "user") => {
        setTestCases((current) =>
            current.map((testCase) =>
                testCase.id === id
                    ? {
                        ...testCase,
                        conversation: [
                            ...(testCase.conversation || []),
                            { id: crypto.randomUUID(), role, content: "" },
                        ],
                    }
                    : testCase
            )
        );
    };

    const updateConversationTurn = (id: string, turnId: string, field: "role" | "content", value: string) => {
        setTestCases((current) =>
            current.map((testCase) =>
                testCase.id === id
                    ? {
                        ...testCase,
                        conversation: (testCase.conversation || []).map((turn) =>
                            turn.id === turnId ? { ...turn, [field]: value } : turn
                        ),
                    }
                    : testCase
            )
        );
    };

    const removeConversationTurn = (id: string, turnId: string) => {
        setTestCases((current) =>
            current.map((testCase) =>
                testCase.id === id
                    ? {
                        ...testCase,
                        conversation: (testCase.conversation || []).filter((turn) => turn.id !== turnId),
                    }
                    : testCase
            )
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

    const saveSchedule = async (schedule: ScheduledEvaluation) => {
        await persistence.saveSchedule(schedule);
        await refreshAssets();
    };

    const deleteSchedule = async (id: string) => {
        await persistence.deleteSchedule(id);
        await refreshAssets();
    };

    const runScheduleNow = async (id: string) => {
        const schedule = schedules.find((entry) => entry.id === id);
        if (!schedule) {
            throw new Error("Scheduled evaluation not found.");
        }

        await executeSchedule(schedule);
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
                setGlobalBaselinePromptVersionId,
                setSuiteBaselinePromptVersionId,
                modelId,
                setModelId,
                results,
                loading,
                error,
                activeRunId,
                suites,
                promptVersions,
                schedules,
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
                addConversationTurn,
                updateConversationTurn,
                removeConversationTurn,
                removeTestCase,
                loadRun,
                saveCurrentSuite,
                importSuites,
                loadSuite,
                deleteSuite: deleteSuiteRecord,
                savePromptVersion,
                loadPromptVersion,
                deletePromptVersion: deletePromptVersionRecord,
                saveSchedule,
                deleteSchedule,
                runScheduleNow,
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
