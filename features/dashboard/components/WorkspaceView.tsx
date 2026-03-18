"use client";

import { ConfigSection } from "./ConfigSection";
import { TestCasesSection } from "./TestCasesSection";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";

export function WorkspaceView() {
    const {
        systemPrompt,
        setSystemPrompt,
        userInput,
        setUserInput,
        batchSize,
        threshold,
        setThreshold,
        modelId,
        setModelId,
        results,
        testCases,
        addTestCase,
        updateTestCase,
        updateVariable,
        removeTestCase,
        setTestCases,
        pushToast,
    } = useDashboardWorkspace();

    return (
        <div className="flex flex-col gap-8 text-sm xl:flex-row xl:items-stretch">
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
    );
}
