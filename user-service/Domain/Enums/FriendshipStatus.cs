namespace Domain.Enums;

public enum FriendshipStatus
{
    Pending,
    Active,
    Blocked,
    Archived,
    Cancelled,  // Still needed for the handler logic, but records will be deleted
    Rejected    // Still needed for the handler logic, but records will be deleted
}