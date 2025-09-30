using System;

namespace Domain.Enums;

[Flags]
public enum MessageStatus
{
    Read = 1,
    Sent = 2,
    Delivered = 4,
    Modified = 8,
}
