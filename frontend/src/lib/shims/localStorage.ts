// lib/shims/localStorage.ts
export const localStorageShim = (() => {
    if (typeof window === "undefined") {
        const store: Record<string, string> = {};
        return {
            getItem: (key: string) => store[key] ?? null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; },
            clear: () => { for (const key in store) delete store[key]; },
        };
    }
    return window.localStorage;
})();