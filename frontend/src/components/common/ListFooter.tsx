"use client";

type ListFooterProps = {
    loading: boolean;
    hasMore: boolean;
    itemsCount: number;
    label: string; // "friends", "requests", etc.
};

export default function ListFooter({ loading, hasMore, itemsCount, label }: ListFooterProps) {
    if (loading && itemsCount > 0) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <p className="text-muted text-sm">Loading more...</p>
            </div>
        );
    }

    if (!hasMore && itemsCount > 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted text-sm">No more {label}</p>
            </div>
        );
    }

    return null;
}