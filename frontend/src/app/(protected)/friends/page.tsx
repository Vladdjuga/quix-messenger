"use client";

import { useEffect, useState } from "react";
import { ReadFriendshipDto } from "@/lib/dto/ReadFriendshipDto";
import { api } from "@/app/api";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function FriendsPage() {
    const [friends, setFriends] = useState<ReadFriendshipDto[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | undefined>();

    async function fetchFriends(append = false, query = "") {
        setIsLoading(true);
        setError(null);

        try {
            const data = query.trim() 
                ? await api.contact.searchContacts(
                    query, 
                    PAGE_SIZE,
                    append ? lastCreatedAt : undefined
                ).then(res => res.data)
                : await api.contact.getContacts(
                    PAGE_SIZE,
                    append ? lastCreatedAt : undefined
                ).then(res => res.data);

            if (append) {
                setFriends(prev => [...prev, ...data]);
            } else {
                setFriends(data);
            }

            setHasMore(data.length === PAGE_SIZE);
            // Set lastCreatedAt for pagination if data exists
            if (data.length > 0) {
                setLastCreatedAt(data[data.length - 1].createdAt.toString());
            }
        } catch (e) {
            const err = e as Error;
            setError(err.message || "Failed to load friends");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFriends(false, searchQuery);
    }, [searchQuery]);

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">My Friends</h1>
                <a 
                    href="/find-people" 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Find People
                </a>
            </div>
            
            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search your friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            
            <ul className="divide-y">
                {friends.map(friend => (
                    <li key={friend.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{friend.username}</p>
                            <p className="text-xs text-gray-400">{friend.email}</p>
                            <p className="text-xs text-green-600">
                                Friends since {new Date(friend.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="border rounded px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600"
                                onClick={() => {
                                    // TODO: Navigate to chat with this friend
                                    console.log("Open chat with", friend.username);
                                }}
                            >
                                Message
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            
            {friends.length === 0 && !isLoading && searchQuery && (
                <p className="text-gray-500 text-center py-8">
                    No friends found matching &ldquo;{searchQuery}&rdquo;
                </p>
            )}
            
            {friends.length === 0 && !isLoading && !searchQuery && (
                <div className="text-gray-500 text-center py-8">
                    <p>You don&apos;t have any friends yet.</p>
                    <a 
                        href="/find-people" 
                        className="text-blue-500 hover:text-blue-600 underline"
                    >
                        Find people to connect with
                    </a>
                </div>
            )}
            
            {hasMore && !isLoading && (
                <div className="pt-3">
                    <button 
                        className="border rounded px-3 py-2" 
                        onClick={() => fetchFriends(true, searchQuery)}
                        disabled={isLoading}
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}
