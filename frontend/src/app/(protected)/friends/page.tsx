"use client";

import {useEffect, useState} from "react";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {searchUsersUseCase} from "@/lib/usecases/user/searchUsersUseCase";
import {api} from "@/app/api";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function FriendsSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ReadUserDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | undefined>();

    async function fetchUsers(append = false) {
        if (!query.trim()) {
            setResults([]);
            setHasMore(false);
            setLastCreatedAt(undefined);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await searchUsersUseCase(
                query, 
                PAGE_SIZE,
                append ? lastCreatedAt : undefined
            );

            if (append) {
                setResults(prev => [...prev, ...data]);
            } else {
                setResults(data);
            }

            setHasMore(data.length === PAGE_SIZE);
            // For now, we'll use simple pagination without cursor-based approach
            // since ReadUserDto doesn't have createdAt
            setLastCreatedAt(undefined);
        } catch (e) {
            const err = e as Error;
            setError(err.message || "Failed to search users");
        } finally {
            setIsLoading(false);
        }
    }

    async function sendFriendRequest(username: string) {
        try {
            await api.contact.requestFriendship(username);
            // Optionally show success message or remove user from results
            setResults(prev => prev.filter(user => user.username !== username));
        } catch (error) {
            const err = error as Error;
            setError(err.message || "Failed to send friend request");
        }
    }

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([]);
                setHasMore(false);
                setLastCreatedAt(undefined);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const data = await searchUsersUseCase(
                    query, 
                    PAGE_SIZE,
                    undefined
                );

                setResults(data);
                setHasMore(data.length === PAGE_SIZE);
                setLastCreatedAt(undefined);
            } catch (e) {
                const err = e as Error;
                setError(err.message || "Failed to search users");
                console.error("Error fetching users:", err);
            } finally {
                setIsLoading(false);
            }
        };

        searchUsers();
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
                {results.map(user => (
                    <li key={user.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex items-center">
                            <button
                                className="border rounded px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => sendFriendRequest(user.username)}
                                disabled={isLoading}
                            >
                                Add Friend
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {results.length === 0 && query && !isLoading && (
                <p className="text-gray-500 text-center py-8">No users found for &ldquo;{query}&rdquo;</p>
            )}
            {hasMore && !isLoading && (
                <div className="pt-3">
                    <button 
                        className="border rounded px-3 py-2" 
                        onClick={() => fetchUsers(true)}
                        disabled={isLoading}
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}
