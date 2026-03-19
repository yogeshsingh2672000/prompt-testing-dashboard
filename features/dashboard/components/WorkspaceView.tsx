"use client";

import { ConfigSection } from "./ConfigSection";
import { TestCasesSection } from "./TestCasesSection";
import { WorkspaceAssetsPanel } from "./WorkspaceAssetsPanel";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export function WorkspaceView() {
    const {
        systemPrompt,
        setSystemPrompt,
        userInput,
        setUserInput,
        batchSize,
        threshold,
        setThreshold,
        rubrics,
        updateRubric,
        providerId,
        setProviderId,
        modelId,
        setModelId,
        results,
        testCases,
        addTestCase,
        updateTestCase,
        updateVariable,
        updateOutputValidation,
        addConversationTurn,
        updateConversationTurn,
        removeConversationTurn,
        removeTestCase,
        setTestCases,
        pushToast,
    } = useDashboardWorkspace();

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Workspace"
                title="Design prompts and build robust evaluation cases"
                description="Shape your system prompt, define user-input templates, and curate the test cases that future comparison and dataset features will build on."
            />
            <WorkspaceAssetsPanel />
            <div className="flex flex-col gap-8 text-sm xl:flex-row xl:items-stretch">
                <ConfigSection
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    batchSize={batchSize}
                    threshold={threshold}
                    setThreshold={setThreshold}
                    rubrics={rubrics}
                    updateRubric={updateRubric}
                    providerId={providerId}
                    setProviderId={setProviderId}
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
                    updateOutputValidation={updateOutputValidation}
                    addConversationTurn={addConversationTurn}
                    updateConversationTurn={updateConversationTurn}
                    removeConversationTurn={removeConversationTurn}
                    removeTestCase={removeTestCase}
                    setTestCases={setTestCases}
                    systemPrompt={systemPrompt}
                    userInputTemplate={userInput}
                    providerId={providerId}
                    modelId={modelId}
                    onError={(message) => pushToast({ title: "Case generation failed", message, variant: "error" })}
                />
            </div>
        </div>
    );
}
