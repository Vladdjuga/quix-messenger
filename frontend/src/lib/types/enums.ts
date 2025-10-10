export enum ChatType {
    Direct = 0,
    Group = 1,
    Channel = 2
}

export enum ChatRole {
    Admin = 0,
    Moderator = 1,
    User = 2
}

// Message delivery / state flags (bitwise-friendly if backend uses flags)
export enum MessageStatus {
    Read = 1,
    Sent = 2,
    Delivered = 4,
    Modified = 8,
    Sending = 16  // Optimistic UI state (not persisted to backend)
}

export enum FriendshipStatus {
    Pending = 0,
    Active = 1,
    Blocked = 2,
    Archived = 3
}
// Used for user status like Online, Offline, Busy, Away
export enum UserStatus{
    PendingSent = "pending_sent",
    PendingReceived = "pending_received",
    Friends = "friends",
    Blocked = "blocked",
    NotFriends = "none",
    Self = "self"
}
