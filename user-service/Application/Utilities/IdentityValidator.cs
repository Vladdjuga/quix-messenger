using System.Text.RegularExpressions;

namespace Application.Utilities;

public static class IdentityValidator
{
    public static bool IsEmail(string identity) =>
        Regex.IsMatch(identity, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");

    public static bool IsUsername(string identity) =>
        Regex.IsMatch(identity, @"^[a-zA-Z0-9_]{3,16}$");
}