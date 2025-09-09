"use client";

import { useFriendRequests } from "@/lib/hooks/data/friendship/useFriendshipLists";
import FriendshipCard from "@/components/user/FriendshipCard";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";
import { UserStatus } from "@/lib/types/enums";

export default function RequestsPage() {
  const { requests, loading, error, refresh, removeRequest } = useFriendRequests();

  if (loading) {
    return <LoadingSpinner message="Loading friend requests..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-4 md:mb-0">Friend Requests</h1>
          <div className="flex space-x-2">
            <a href="/find-people" className="btn-secondary text-sm">
              Find People
            </a>
            <a href="/friends" className="btn-primary text-sm">
              My Friends
            </a>
          </div>
        </div>

        {/* Content */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No Friend Requests</h3>
            <p className="text-muted mb-4">You don&apos;t have any pending friend requests.</p>
            <a href="/find-people" className="btn-primary">
              Find People
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <FriendshipCard
                key={request.id}
                friendship={request}
                type={UserStatus.PendingReceived}
                onRemove={removeRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


