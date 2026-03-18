import { AppSettings, PersistenceProvider, PromptVersion, TestCaseSuite, TestRun } from "./types";
import { IndexedDBProvider } from "./IndexedDBProvider";

class PersistenceService {
    private provider: PersistenceProvider;

    constructor(provider: PersistenceProvider) {
        this.provider = provider;
    }

    // Runs
    async saveRun(run: TestRun) {
        return this.provider.saveRun(run);
    }

    async getRuns() {
        return this.provider.getRuns();
    }

    async getRun(id: string) {
        return this.provider.getRun(id);
    }

    async deleteRun(id: string) {
        return this.provider.deleteRun(id);
    }

    // Suites
    async saveSuite(suite: TestCaseSuite) {
        return this.provider.saveSuite(suite);
    }

    async getSuites() {
        return this.provider.getSuites();
    }

    async getSuite(id: string) {
        return this.provider.getSuite(id);
    }

    async deleteSuite(id: string) {
        return this.provider.deleteSuite(id);
    }

    // Prompt versions
    async savePromptVersion(version: PromptVersion) {
        return this.provider.savePromptVersion(version);
    }

    async getPromptVersions() {
        return this.provider.getPromptVersions();
    }

    async getPromptVersion(id: string) {
        return this.provider.getPromptVersion(id);
    }

    async deletePromptVersion(id: string) {
        return this.provider.deletePromptVersion(id);
    }

    // Settings
    async saveSettings(settings: AppSettings) {
        return this.provider.saveSettings(settings);
    }

    async getSettings() {
        return this.provider.getSettings();
    }

    async clearSettings() {
        return this.provider.clearSettings();
    }

    async clearAll() {
        return this.provider.clearAll();
    }
}

// Export a singleton instance initialized with IndexedDB
// This can be swapped for other providers in tests or future versions
export const persistence = new PersistenceService(new IndexedDBProvider());

export * from "./types";
