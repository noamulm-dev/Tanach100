
import { SearchResult } from '../types';

export interface GlobalSearchResponse {
    results: SearchResult[];
    regularSearchEnabled: boolean;
}

let activeWorker: Worker | null = null;

export const searchGlobal = async (
    query: string,
    wholeWord: boolean,
    scope: 'current' | 'torah' | 'tanakh',
    currentBookId: string,
    onProgress?: (percent: number) => void
): Promise<GlobalSearchResponse> => {

    // Terminate existing worker if running (debounce/cancel previous search)
    if (activeWorker) {
        activeWorker.terminate();
    }

    return new Promise((resolve, reject) => {
        try {
            activeWorker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), { type: 'module' });

            activeWorker.onmessage = (e) => {
                const { type, results, regularSearchEnabled, percent, error } = e.data;

                if (type === 'RESULTS') {
                    if (onProgress) onProgress(100);
                    resolve({ results, regularSearchEnabled });
                    activeWorker?.terminate();
                    activeWorker = null;
                } else if (type === 'PROGRESS') {
                    if (onProgress) onProgress(percent);
                } else if (type === 'ERROR') {
                    reject(new Error(error));
                    activeWorker?.terminate();
                    activeWorker = null;
                }
            };

            activeWorker.onerror = (err) => {
                reject(err);
                activeWorker?.terminate();
                activeWorker = null;
            };

            activeWorker.postMessage({
                type: 'START',
                payload: { query, wholeWord, scope, currentBookId }
            });

        } catch (error) {
            reject(error);
        }
    });
};

