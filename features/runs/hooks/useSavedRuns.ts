"use client";

import { useEffect, useState } from "react";
import { persistence, TestRun } from "@/shared/lib/persistence";

export function useSavedRuns() {
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRuns = async () => {
        setLoading(true);
        const savedRuns = await persistence.getRuns();
        setRuns(savedRuns.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadRuns();
        }, 0);

        const handleRunsUpdated = () => {
            void loadRuns();
        };

        window.addEventListener("promitly:runs-updated", handleRunsUpdated);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("promitly:runs-updated", handleRunsUpdated);
        };
    }, []);

    return {
        runs,
        loading,
        loadRuns,
        setRuns,
    };
}
