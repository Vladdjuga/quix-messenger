"use client";

import { useFriends } from "@/lib/hooks/data/friendship/useFriendshipLists";
import FriendshipCard from "@/components/user/FriendshipCard";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";
import { useState, useMemo } from "react";
import { UserStatus } from "@/lib/types/enums";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { friends, loading, error, refetch, removeFriend } = useFriends();

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    
    const query = searchQuery.toLowerCase();
    return friends.filter(friend => 
      friend.user.username.toLowerCase().includes(query) ||
      friend.user.email.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  if (loading && friends.length === 0) {
    return <LoadingSpinner message="Loading friends..." />;
  }

  if (error && friends.length === 0) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-4 md:mb-0">My Friends</h1>
          <div className="flex space-x-2">
            <a href="/find-people" className="btn-secondary text-sm">
              Find People
            </a>
            <a href="/sent-requests" className="btn-primary text-sm">
              Sent Requests
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search your friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {/* Content */}
        {error && friends.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {filteredFriends.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-primary mb-2">No friends found</h3>
                <p className="text-muted mb-4">No friends match your search for &quot;{searchQuery}&quot;</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-primary mb-2">No Friends Yet</h3>
                <p className="text-muted mb-4">You haven&apos;t added any friends yet.</p>
              </>
            )}
            <a href="/find-people" className="btn-primary">
              Find People
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFriends.map(friend => (
              <FriendshipCard
                key={friend.id}
                friendship={friend}
                type={UserStatus.Friends}
                onRemove={removeFriend}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
