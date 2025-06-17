using Domain.Enums;

namespace Application.Extensions;

public static class EnumExtensions
{
    public static bool HasFlagValue(this MessageStatus status, MessageStatus flag)
    {
        return (status & flag) == flag;
    }
    
}