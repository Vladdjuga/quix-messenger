"use client";

import { useFriendRequests } from "@/lib/hooks/data/friendship/useFriendshipLists";
import FriendshipCard from "@/components/user/FriendshipCard";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import EmptyState from "@/components/common/EmptyState";
import ListFooter from "@/components/common/ListFooter";
import FriendshipHeader from "@/components/headers/FriendshipHeader";
import { UserStatus } from "@/lib/types/enums";
import { useRef, useState } from "react";
import { SCROLL_TO_TOP_THRESHOLD_PX, SCROLL_THRESHOLD_PX } from "@/lib/constants/pagination";

export default function RequestsPage() {
  const { requests, loading, error, refetch, removeRequest, hasMore, fetchMore } = useFriendRequests();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = async () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    setShowScrollTop(scrollTop > SCROLL_TO_TOP_THRESHOLD_PX);

    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX && hasMore && !loading) {
      await fetchMore();
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && requests.length === 0) {
    return <LoadingSpinner message="Loading friend requests..." />;
  }

  if (error && requests.length === 0) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="min-h-screen bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <FriendshipHeader
          title="Friend Requests"
          links={[
            { href: "/find-people", label: "Find People", variant: "secondary" },
            { href: "/friends", label: "My Friends", variant: "primary" },
          ]}
        />

        {/* Error banner */}
        {error && requests.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {requests.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            title="No Friend Requests"
            description="You don't have any pending friend requests."
            action={{ href: "/find-people", label: "Find People" }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {requests.map(request => (
                <FriendshipCard
                  key={request.id}
                  friendship={request}
                  type={UserStatus.PendingReceived}
                  onRemove={removeRequest}
                  onAccept={removeRequest}
                />
              ))}
            </div>

            {/* Footer (loading / end of list) */}
            <ListFooter
              loading={loading}
              hasMore={hasMore}
              itemsCount={requests.length}
              label="requests"
            />
          </>
        )}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && <ScrollToTopButton onClick={scrollToTop} />}
    </div>
  );
}


