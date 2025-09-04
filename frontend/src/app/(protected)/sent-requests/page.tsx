"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/api";
import { ReadFriendshipDto } from "@/lib/dto/ReadFriendshipDto";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? '20');

export default function SentRequestsPage() {
    const [items, setItems] = useState<ReadFriendshipDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.friendship.getSentRequests("", PAGE_SIZE);
                const list: ReadFriendshipDto[] = Array.isArray(data) ? (data as ReadFriendshipDto[]) : [];
                setItems(list);
            } catch (e) {
                const err = e as { response?: { data?: string } };
                setError(err.response?.data ?? "Failed to load sent requests");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const cancelRequest = async (friendshipId: string) => {
        try {
            setLoading(true);
            await api.friendship.cancelFriendRequest(friendshipId);
            setItems(prev => prev.filter(x => x.id !== friendshipId));
        } catch (e) {
            const err = e as { response?: { data?: string } };
            setError(err.response?.data ?? "Failed to cancel request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Sent Friend Requests</h1>
            <p className="text-gray-600">Friend requests you&apos;ve sent to other users.</p>
            
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            
            <ul className="divide-y">
                {items.map((request) => (
                    <li key={request.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{request.username}</p>
                            <p className="text-sm text-gray-500">{request.email}</p>
                            <p className="text-xs text-gray-400">
                                Sent on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                Pending
                            </span>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white border rounded px-3 py-1 text-sm"
                                onClick={() => cancelRequest(request.id)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            
            {items.length === 0 && !loading && !error && (
                <p className="text-gray-500 text-center py-8">
                    No sent requests found. Go to the{" "}
                    <a href="/find-people" className="text-blue-500 hover:underline">
                        Find People
                    </a>{" "}
                    page to send friend requests.
                </p>
            )}
        </div>
    );
}
