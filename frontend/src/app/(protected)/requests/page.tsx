"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/api";
import { ReadFriendshipDto } from "@/lib/dto/ReadFriendshipDto";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function RequestsPage() {
    const [items, setItems] = useState<ReadFriendshipDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // This can be wired to a dedicated endpoint later; for now reuse search with empty query
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.friendship.getFriendRequests("", PAGE_SIZE);
                const list: ReadFriendshipDto[] = Array.isArray(data) ? (data as ReadFriendshipDto[]) : [];
                setItems(list);
            } catch (e) {
                const err = e as { response?: { data?: string } };
                setError(err.response?.data ?? "Failed to load requests");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Friend requests</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <ul className="divide-y">
                {items.map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{c.username}</p>
                            <p className="text-sm text-gray-500">{c.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white border rounded px-3 py-1 text-sm"
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await api.friendship.acceptFriendship(c.id);
                                        setItems(prev => prev.filter(x => x.id !== c.id));
                                    } catch (e) {
                                        const err = e as { response?: { data?: string } };
                                        setError(err.response?.data ?? "Failed to accept");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                            >Accept</button>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white border rounded px-3 py-1 text-sm"
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        // For now, we'll just remove from the list. You might want to add a reject endpoint later
                                        setItems(prev => prev.filter(x => x.id !== c.id));
                                    } catch (e) {
                                        const err = e as { response?: { data?: string } };
                                        setError(err.response?.data ?? "Failed to reject");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                            >Reject</button>
                        </div>
                    </li>
                ))}
            </ul>
            {items.length === 0 && !loading && !error && (
                <p className="text-gray-500 text-center py-8">No friend requests found.</p>
            )}
        </div>
    );
}


