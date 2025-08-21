"use client";

import {useEffect, useState} from "react";
import {api} from "@/app/api";
import {ReadContactDto} from "@/lib/dto/ReadContactDto";
import {ContactStatus} from "@/lib/types/enums";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function FriendsSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ReadContactDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | undefined>();

    const fetchContacts = async (append = false) => {
        if (!query) {
            setResults([]);
            setHasMore(false);
            setLastCreatedAt(undefined);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const {data} = await api.contact.searchByUsernamePaged(query, PAGE_SIZE,
                append ? lastCreatedAt : undefined);

            if (append) {
                setResults(prev => [...prev, ...data]);
            } else {
                setResults(data);
            }

            setHasMore(data.length === PAGE_SIZE);
            const lastItem = data.at(-1);
            setLastCreatedAt(lastItem?.createdAt ? new Date(lastItem.createdAt).toISOString() : undefined);
        } catch (e) {
            const err = e as { response?: { data?: string } };
            setError(err.response?.data ?? "Failed to load contacts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(false)
            .catch(err => {
                console.error("Error fetching contacts:", err);
                setError("Failed to load contacts");
                setIsLoading(false);
            });
    }, [query]);

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Find friends</h1>
            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <ul className="divide-y">
                {results.map(c => (
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
                                        setIsLoading(true);
                                        await api.contact.acceptFriendship(c.id);
                                        setResults(prev => {
                                            return prev.map(x => x.id === c.id ?
                                                {...x, status: ContactStatus.Active} : x);
                                        });
                                        setIsLoading(false);
                                    }}
                                >Accept</button>
                            ) : (
                                <button
                                    className="ml-3 border rounded px-2 py-1 text-sm"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        await api.contact.requestFriendship(c.username);
                                        setResults(prev => prev.map(
                                            x => x.id === c.id ?
                                            {...x, status: ContactStatus.Pending} : x));
                                        setIsLoading(false);
                                    }}
                                >Request</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {hasMore && !isLoading && (
                <div className="pt-3">
                    <button className="border rounded px-3 py-2" onClick={() => fetchContacts(true)}>
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}
