using System.Text.RegularExpressions;

namespace Application.Utilities;

public static partial class RegexValidator
{
    public static bool IsEmail(string identity) =>
        EmailRegex().IsMatch(identity);

    public static bool IsUsername(string identity) =>
        UsernameRegex().IsMatch(identity);
    
    public static bool IsValidIdentity(string identity) =>
        IsEmail(identity) || IsUsername(identity);
    
    public static bool IsValidPassword(string password) =>
        PasswordRegex().IsMatch(password);
    
    [GeneratedRegex(@"^(?=.*[a-z]{2,})(?=.*[A-Z]{2,})(?=.*\d{2,})(?=.*[@$!%*?&#+\-_=]{1,})[A-Za-z\d@$!%*?&#+\-_=]{12,128}$")]
    private static partial Regex PasswordRegex();
    [GeneratedRegex(@"^[a-zA-Z0-9_]{3,16}$")]
    private static partial Regex UsernameRegex();
    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]
    private static partial Regex EmailRegex();
}