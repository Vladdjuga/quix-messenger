"use client";

import {useEffect, useState} from "react";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {searchUsersUseCase} from "@/lib/usecases/user/searchUsersUseCase";
import {api} from "@/app/api";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

type UserRelationshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

interface UserWithStatus {
    user: ReadUserDto;
    status: UserRelationshipStatus;
    contactId?: string;
}

export default function FindPeoplePage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | undefined>();
    const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
    const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});

    async function checkUserRelationshipStatus(users: ReadUserDto[]): Promise<UserWithStatus[]> {
        // Get all existing contacts to check relationship status
        try {
            const [friendRequests, friends] = await Promise.all([
                api.contact.getFriendRequests("", 1000).then(res => res.data), // Get all pending requests
                api.contact.getContacts(1000).then(res => res.data) // Get all friends
            ]);

            return users.map(user => {
                // Check if this user is already a friend (ReadContactDto.username matches)
                const existingFriend = friends.find(f => f.username === user.username);
                if (existingFriend) {
                    return { user, status: 'friends' as UserRelationshipStatus, contactId: existingFriend.id };
                }

                // Check if there's a pending request from this user
                const pendingRequest = friendRequests.find(req => req.username === user.username);
                if (pendingRequest) {
                    return { user, status: 'pending_received' as UserRelationshipStatus, contactId: pendingRequest.id };
                }

                // For sent requests, we'll track them locally (since we don't have an endpoint for outgoing requests)
                return { user, status: 'none' as UserRelationshipStatus };
            });
        } catch (error) {
            console.error("Failed to check relationship status:", error);
            // Fallback: return users with 'none' status
            return users.map(user => ({ user, status: 'none' as UserRelationshipStatus }));
        }
    }

    async function fetchUsers(append = false) {
        if (!query.trim()) {
            setResults([]);
            setHasMore(false);
            setLastCreatedAt(undefined);
            setSendingRequests(new Set());
            setRequestErrors({});
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userData = await searchUsersUseCase(
                query, 
                PAGE_SIZE,
                append ? lastCreatedAt : undefined
            );

            const usersWithStatus = await checkUserRelationshipStatus(userData);

            if (append) {
                setResults(prev => [...prev, ...usersWithStatus]);
            } else {
                setResults(usersWithStatus);
                setSendingRequests(new Set());
                setRequestErrors({});
            }

            setHasMore(userData.length === PAGE_SIZE);
            setLastCreatedAt(undefined);
        } catch (e) {
            const err = e as Error;
            setError(err.message || "Failed to search users");
        } finally {
            setIsLoading(false);
        }
    }

    async function sendFriendRequest(username: string) {
        setSendingRequests(prev => new Set([...prev, username]));
        try {
            setRequestErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[username];
                return newErrors;
            });
            
            await api.contact.requestFriendship(username);
            
            // Update the user's status to show request was sent
            setResults(prev => prev.map(item => 
                item.user.username === username 
                    ? { ...item, status: 'pending_sent' as UserRelationshipStatus }
                    : item
            ));
        } catch (error: unknown) {
            interface ErrorResponse {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
                message?: string;
            }
            
            const err = error as ErrorResponse;
            const errorMessage = err?.response?.data?.message || 
                                err?.message || 
                                "Failed to send friend request";
            
            // Check if it's a duplicate request error
            if (errorMessage.includes("already exists")) {
                setResults(prev => prev.map(item => 
                    item.user.username === username 
                        ? { ...item, status: 'pending_sent' as UserRelationshipStatus }
                        : item
                ));
                setRequestErrors(prev => ({ ...prev, [username]: "Request already sent" }));
            } else {
                setRequestErrors(prev => ({ ...prev, [username]: errorMessage }));
            }
        } finally {
            setSendingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(username);
                return newSet;
            });
        }
    }

    function getStatusDisplay(userWithStatus: UserWithStatus) {
        const { status } = userWithStatus;
        
        switch (status) {
            case 'friends':
                return <span className="text-sm text-green-600 font-medium">✓ Friends</span>;
            case 'pending_sent':
                return <span className="text-sm text-blue-600">Request sent</span>;
            case 'pending_received':
                return <span className="text-sm text-yellow-600">Request received</span>;
            case 'none':
            default:
                return (
                    <button
                        className="border rounded px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
                        onClick={() => sendFriendRequest(userWithStatus.user.username)}
                        disabled={isLoading || sendingRequests.has(userWithStatus.user.username)}
                    >
                        {sendingRequests.has(userWithStatus.user.username) ? 'Sending...' : 'Add Friend'}
                    </button>
                );
        }
    }

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([]);
                setHasMore(false);
                setLastCreatedAt(undefined);
                setSendingRequests(new Set());
                setRequestErrors({});
                return;
            }

            setIsLoading(true);
            setError(null);
            setSendingRequests(new Set());
            setRequestErrors({});

            try {
                const userData = await searchUsersUseCase(
                    query, 
                    PAGE_SIZE,
                    undefined
                );

                const usersWithStatus = await checkUserRelationshipStatus(userData);
                setResults(usersWithStatus);
                setHasMore(userData.length === PAGE_SIZE);
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Find People</h1>
                <a 
                    href="/friends" 
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    My Friends
                </a>
            </div>
            
            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            
            <ul className="divide-y">
                {results.map(userWithStatus => (
                    <li key={userWithStatus.user.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{userWithStatus.user.username}</p>
                            <p className="text-sm text-gray-500">
                                {userWithStatus.user.firstName} {userWithStatus.user.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{userWithStatus.user.email}</p>
                            {requestErrors[userWithStatus.user.username] && (
                                <p className="text-xs text-red-500 mt-1">
                                    {requestErrors[userWithStatus.user.username]}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center">
                            {getStatusDisplay(userWithStatus)}
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