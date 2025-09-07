export enum ChatType {
    Direct = "Direct",
    Group = "Group",
    Channel = "Channel"
}

export enum ChatRole {
    Admin = "Admin",
    Moderator = "Moderator",
    User = "User"
}

export enum FriendshipStatus {
    Pending = "Pending",
    Active = "Active",
    Blocked = "Blocked",
    Archived = "Archived"
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
