"use client";

import { useFriends } from "@/lib/hooks/data/friendship/useFriendshipLists";
import FriendshipCard from "@/components/user/FriendshipCard";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { useState, useRef } from "react";
import { UserStatus } from "@/lib/types/enums";
import { SCROLL_TO_TOP_THRESHOLD_PX, SCROLL_THRESHOLD_PX } from "@/lib/constants/pagination";

import EmptyState from "@/components/common/EmptyState";
import ListFooter from "@/components/common/ListFooter";
import FriendshipHeader from "@/components/headers/FriendshipHeader";
import FriendSearchInput from "@/components/searching/friends/FriendsSearchInput";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { friends, loading, error, refetch, removeFriend, hasMore, fetchMore } = useFriends(searchQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // scroll handler
  const handleScroll = async () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    setShowScrollTop(scrollTop > SCROLL_TO_TOP_THRESHOLD_PX);

    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX && hasMore && !loading) {
      await fetchMore();
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && friends.length === 0) {
    return <LoadingSpinner message="Loading friends..." />;
  }

  if (error && friends.length === 0) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
      <div ref={containerRef} onScroll={handleScroll} className="min-h-screen bg-background overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <FriendshipHeader
              title="My Friends"
              links={[
                { href: "/find-people", label: "Find People", variant: "secondary" },
                { href: "/sent-requests", label: "Sent Requests", variant: "primary" },
              ]}
          />

          {/* Search */}
          <div className="mb-6">
            <FriendSearchInput
                value={searchQuery}
                onChangeAction={setSearchQuery}
                placeholder="Search your friends..."
            />
          </div>

          {/* Error banner */}
          {error && friends.length > 0 && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
          )}

          {/* Content */}
          {friends.length === 0 && !loading ? (
              <EmptyState
                  icon={
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  title={searchQuery ? "No friends found" : "No Friends Yet"}
                  description={
                    searchQuery
                        ? `No friends match your search for "${searchQuery}"`
                        : "You haven’t added any friends yet."
                  }
                  action={{ href: "/find-people", label: "Find People" }}
              />
          ) : (
              <>
                <div className="space-y-3">
                  {friends.map(friend => (
                      <FriendshipCard
                          key={friend.id}
                          friendship={friend}
                          type={UserStatus.Friends}
                          onRemove={removeFriend}
                      />
                  ))}
                </div>

                {/* Footer (loading / end of list) */}
                <ListFooter
                    loading={loading}
                    hasMore={hasMore}
                    itemsCount={friends.length}
                    label="friends"
                />
              </>
          )}
        </div>

        {/* Scroll to top button */}
        {showScrollTop && <ScrollToTopButton onClick={scrollToTop} />}
      </div>
  );
}
