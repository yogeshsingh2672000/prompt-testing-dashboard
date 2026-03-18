import { PersistenceProvider, PromptVersion, TestRun, TestCaseSuite } from "./types";

const DB_NAME = "PromitlyDB";
const DB_VERSION = 2;
const STORES = {
    RUNS: "evaluation_runs",
    SUITES: "test_case_suites",
    PROMPT_VERSIONS: "prompt_versions"
};

export class IndexedDBProvider implements PersistenceProvider {
    private db: IDBDatabase | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORES.RUNS)) {
                    db.createObjectStore(STORES.RUNS, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(STORES.SUITES)) {
                    db.createObjectStore(STORES.SUITES, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(STORES.PROMPT_VERSIONS)) {
                    db.createObjectStore(STORES.PROMPT_VERSIONS, { keyPath: "id" });
                }
            };
        });
    }

    private async perform<T>(
        storeName: string,
        mode: IDBTransactionMode,
        action: (store: IDBObjectStore) => IDBRequest<T> | void
    ): Promise<T> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = action(store);

            if (request) {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }

            transaction.oncomplete = () => {
                if (!request) resolve(undefined as T);
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Runs
    async saveRun(run: TestRun): Promise<void> {
        await this.perform(STORES.RUNS, "readwrite", (store) => store.put(run));
    }

    async getRuns(): Promise<TestRun[]> {
        return this.perform<TestRun[]>(STORES.RUNS, "readonly", (store) => store.getAll());
    }

    async getRun(id: string): Promise<TestRun | undefined> {
        return this.perform<TestRun>(STORES.RUNS, "readonly", (store) => store.get(id));
    }

    async deleteRun(id: string): Promise<void> {
        await this.perform(STORES.RUNS, "readwrite", (store) => store.delete(id));
    }

    // Suites
    async saveSuite(suite: TestCaseSuite): Promise<void> {
        await this.perform(STORES.SUITES, "readwrite", (store) => store.put(suite));
    }

    async getSuites(): Promise<TestCaseSuite[]> {
        return this.perform<TestCaseSuite[]>(STORES.SUITES, "readonly", (store) => store.getAll());
    }

    async getSuite(id: string): Promise<TestCaseSuite | undefined> {
        return this.perform<TestCaseSuite>(STORES.SUITES, "readonly", (store) => store.get(id));
    }

    async deleteSuite(id: string): Promise<void> {
        await this.perform(STORES.SUITES, "readwrite", (store) => store.delete(id));
    }

    // Prompt versions
    async savePromptVersion(version: PromptVersion): Promise<void> {
        await this.perform(STORES.PROMPT_VERSIONS, "readwrite", (store) => store.put(version));
    }

    async getPromptVersions(): Promise<PromptVersion[]> {
        return this.perform<PromptVersion[]>(STORES.PROMPT_VERSIONS, "readonly", (store) => store.getAll());
    }

    async getPromptVersion(id: string): Promise<PromptVersion | undefined> {
        return this.perform<PromptVersion>(STORES.PROMPT_VERSIONS, "readonly", (store) => store.get(id));
    }

    async deletePromptVersion(id: string): Promise<void> {
        await this.perform(STORES.PROMPT_VERSIONS, "readwrite", (store) => store.delete(id));
    }

    async clearAll(): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction([STORES.RUNS, STORES.SUITES, STORES.PROMPT_VERSIONS], "readwrite");
        transaction.objectStore(STORES.RUNS).clear();
        transaction.objectStore(STORES.SUITES).clear();
        transaction.objectStore(STORES.PROMPT_VERSIONS).clear();
    }
}
