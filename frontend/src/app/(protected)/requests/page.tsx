"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/api";
import { ReadContactDto } from "@/lib/dto/ReadContactDto";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function RequestsPage() {
    const [items, setItems] = useState<ReadContactDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // This can be wired to a dedicated endpoint later; for now reuse search with empty query
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.contact.getFriendRequests("", PAGE_SIZE);
                const list: ReadContactDto[] = Array.isArray(data) ? (data as ReadContactDto[]) : [];
                setItems(list.filter((x) => x.status === "Pending"));
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
                        <div className="flex items-center">
                            <button
                                className="ml-3 border rounded px-2 py-1 text-sm"
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await api.contact.acceptFriendship(c.id);
                                        setItems(prev => prev.filter(x => x.id !== c.id));
                                    } catch (e) {
                                        const err = e as { response?: { data?: string } };
                                        setError(err.response?.data ?? "Failed to accept");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >Accept</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


