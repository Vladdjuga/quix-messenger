"use client";

import { useSentRequests } from "@/lib/hooks/data/friendship/useFriendshipLists";
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

export default function SentRequestsPage() {
  const { sentRequests, loading, error, refetch, removeRequest, hasMore, fetchMore } = useSentRequests();
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

  if (loading && sentRequests.length === 0) {
    return <LoadingSpinner message="Loading sent requests..." />;
  }

  if (error && sentRequests.length === 0) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="min-h-screen bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <FriendshipHeader
          title="Sent Requests"
          links={[
            { href: "/find-people", label: "Find People", variant: "secondary" },
            { href: "/friends", label: "My Friends", variant: "primary" },
          ]}
        />

        {/* Error banner */}
        {error && sentRequests.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {sentRequests.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No Sent Requests"
            description="You haven't sent any friend requests yet."
            action={{ href: "/find-people", label: "Find People" }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {sentRequests.map(request => (
                <FriendshipCard
                  key={request.id}
                  friendship={request}
                  type={UserStatus.PendingSent}
                  onRemove={removeRequest}
                  onAccept={removeRequest}
                />
              ))}
            </div>

            {/* Footer (loading / end of list) */}
            <ListFooter
              loading={loading}
              hasMore={hasMore}
              itemsCount={sentRequests.length}
              label="sent requests"
            />
          </>
        )}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && <ScrollToTopButton onClick={scrollToTop} />}
    </div>
  );
}
