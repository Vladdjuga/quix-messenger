"use client";

import { useEffect, useState } from "react";
import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import { searchUsersUseCase } from "@/lib/usecases/user/searchUsersUseCase";
import { api } from "@/app/api";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 20);

type UserRelationshipStatus = "none" | "pending_sent" | "pending_received" | "friends";

interface UserWithStatus {
    user: ReadUserDto;
    status: UserRelationshipStatus;
    contactId?: string;
}

export default function FindPeoplePage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserWithStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string>();

    async function getStatuses(users: ReadUserDto[]): Promise<UserWithStatus[]> {
        try {
            const [requests, friends] = await Promise.all([
                api.contact.getFriendRequests("", PAGE_SIZE)
                    .then(res => res.data),
                api.contact.getContacts(PAGE_SIZE)
                    .then(res => res.data),
            ]);

            return users.map(user => {
                if (friends.some(f => f.username === user.username))
                    return { user, status: "friends" };

                if (requests.some(r => r.username === user.username))
                    return { user, status: "pending_received" };

                return { user, status: "none" };
            });
        } catch {
            return users.map(user => ({ user, status: "none" }));
        }
    }

    async function fetchUsers(append = false) {
        if (!query.trim()) {
            setResults([]);
            setHasMore(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const users = await searchUsersUseCase(query, PAGE_SIZE, append ? lastCreatedAt : undefined);
            const withStatuses = await getStatuses(users);

            setResults(prev => (append ? [...prev, ...withStatuses] : withStatuses));
            setHasMore(users.length === PAGE_SIZE);
            setLastCreatedAt(users.at(-1)?.createdAt.toString());
        } catch (e) {
            setError((e as Error).message ?? "Search failed");
        } finally {
            setLoading(false);
        }
    }

    async function sendRequest(username: string) {
        setSending(username);
        try {
            await api.contact.requestFriendship(username);
            setResults(prev =>
                prev.map(u =>
                    u.user.username === username ? { ...u, status: "pending_sent" } : u
                )
            );
        } catch (e) {
            setError((e as Error).message ?? "Failed to send request");
        } finally {
            setSending(null);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [query]);

    function StatusButton({ u }: { u: UserWithStatus }) {
        switch (u.status) {
            case "friends":
                return <span className="text-green-600 text-sm font-medium">✓ Friends</span>;
            case "pending_sent":
                return <span className="text-blue-600 text-sm">Request sent</span>;
            case "pending_received":
                return <span className="text-yellow-600 text-sm">Request received</span>;
            default:
                return (
                    <button
                        disabled={sending === u.user.username}
                        onClick={() => sendRequest(u.user.username)}
                        className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {sending === u.user.username ? "Sending..." : "Add Friend"}
                    </button>
                );
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Find People</h1>
                <a
                    href="/friends"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    My Friends
                </a>
            </div>

            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full border rounded px-3 py-2"
            />

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            <ul className="divide-y">
                {results.map(u => (
                    <li key={u.user.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{u.user.username}</p>
                            <p className="text-sm text-gray-500">
                                {u.user.firstName} {u.user.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{u.user.email}</p>
                        </div>
                        <StatusButton u={u} />
                    </li>
                ))}
            </ul>

            {!loading && results.length === 0 && query && (
                <p className="text-gray-500 text-center py-8">No users found for &ldquo;{query}&rdquo;</p>
            )}

            {hasMore && !loading && (
                <button
                    onClick={() => fetchUsers(true)}
                    className="border rounded px-3 py-2"
                >
                    Load more
                </button>
            )}
        </div>
    );
}