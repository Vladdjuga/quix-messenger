"use client";
import {useEffect, useState} from "react";
import {api} from "@/app/api";
import {ReadContactDto} from "@/lib/dto/ReadContactDto";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function FriendsSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ReadContactDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pageSize = PAGE_SIZE;
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | undefined>(undefined);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        let isCancelled = false;
        const fetchPage = async (cursor: string | undefined, append: boolean) => {
            if (!debouncedQuery) {
                setResults([]);
                setHasMore(false);
                setLastCreatedAt(undefined);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const {data} = await api.contact.searchByUsernamePaged(debouncedQuery, pageSize, cursor);
                if (isCancelled) return;
                setHasMore(Array.isArray(data) && data.length === pageSize);
                if (append) setResults(prev => [...prev, ...data]); else setResults(data);
                const last = (append ? [...results, ...data] : data);
                const lastItem = last.length > 0 ? last[last.length - 1] : undefined;
                setLastCreatedAt(lastItem ? new Date((lastItem as any).createdAt).toISOString() : undefined);
            } catch (e: any) {
                if (!isCancelled) setError(e?.response?.data ?? "Failed to search");
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };
        fetchPage(undefined, false);
        return () => {
            isCancelled = true;
        };
    }, [debouncedQuery]);

    async function handleLoadMore() {
        setIsLoading(true);
        try {
            const {data} = await api.contact.searchByUsernamePaged(debouncedQuery, pageSize, lastCreatedAt);
            setHasMore(Array.isArray(data) && data.length === pageSize);
            setResults(prev => {
                const combined = [...prev, ...data];
                const lastItem = combined.length > 0 ? combined[combined.length - 1] : undefined;
                setLastCreatedAt(lastItem ? new Date((lastItem as any).createdAt).toISOString() : undefined);
                return combined;
            });
        } catch (e: any) {
            setError(e?.response?.data ?? "Failed to load more");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Find friends</h1>
            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && <p>Searching...</p>}
            {error && <p className="text-red-600">{String(error)}</p>}
            <ul className="divide-y">
                {results.map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{c.username}</p>
                            <p className="text-sm text-gray-500">{c.email}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">
                                {c.status}
                            </span>
                            {c.status === "Pending" ? (
                                <button
                                    className="ml-3 border rounded px-2 py-1 text-sm"
                                    onClick={async () => {
                                        try {
                                            setIsLoading(true);
                                            await api.contact.acceptFriendship(c.id);
                                            setResults(prev => prev.map(x => x.id === c.id ? { ...x, status: "Active" as any } : x));
                                        } catch (e: any) {
                                            setError(e?.response?.data ?? "Failed to accept");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                >Accept</button>
                            ) : (
                                <button
                                    className="ml-3 border rounded px-2 py-1 text-sm"
                                    onClick={async () => {
                                        try {
                                            setIsLoading(true);
                                            await api.contact.requestFriendship(c.username);
                                            setResults(prev => prev.map(x => x.id === c.id ? { ...x, status: "Pending" as any } : x));
                                        } catch (e: any) {
                                            setError(e?.response?.data ?? "Failed to request");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                >Request</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {hasMore && !isLoading && (
                <div className="pt-3">
                    <button className="border rounded px-3 py-2" onClick={handleLoadMore}>Load more</button>
                </div>
            )}
        </div>
    );
}

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}


