"use client";

import { useUserSearch } from "@/lib/hooks/data/user/useUserSearch";
import UserCard from "@/components/user/UserCard";

export default function FindPeoplePage() {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    loadMore,
    updateUserStatus,
    removeUser
  } = useUserSearch();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-4 md:mb-0">Find People</h1>
          <div className="flex space-x-2">
            <a
              href="/sent-requests"
              className="btn-secondary text-sm"
            >
              Sent Requests
            </a>
            <a
              href="/friends"
              className="btn-primary text-sm"
            >
              My Friends
            </a>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="input-search w-full"
          />
        </div>

        {/* Loading State */}
        {loading && results.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-muted">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map(userWithStatus => (
            <UserCard
              key={userWithStatus.user.id}
              userWithStatus={userWithStatus}
              onStatusUpdate={updateUserStatus}
              onUserRemove={removeUser}
            />
          ))}
        </div>

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-8">
            <p className="text-muted">No users found for &quot;{query}&quot;</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              className="btn-secondary"
            >
              Load more
            </button>
          </div>
        )}

        {/* Loading More */}
        {loading && results.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <p className="text-muted text-sm">Loading more...</p>
          </div>
        )}
      </div>
    </div>
  );
}