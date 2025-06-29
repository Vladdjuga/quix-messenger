using Application.Interfaces.Security;
using System.Security.Cryptography;

namespace Application.Services.Security;

public class Pbkdf2StringHasher:IStringHasher
{
    public string Hash(string str)
    {
        var salt = RandomNumberGenerator.GetBytes(18);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            str,
            salt,
            100,
            HashAlgorithmName.SHA256, 
            32);
        return Convert.ToBase64String(salt)+Convert.ToBase64String(hash);
    }
    public bool Verify(string str, string hashedStr)
    {
        var salt = Convert.FromBase64String(hashedStr[..24]);
        var hash = Convert.FromBase64String(hashedStr[24..]);
        var newHash = Rfc2898DeriveBytes.Pbkdf2(
            str,
            salt,
            100,
            HashAlgorithmName.SHA256, 
            32);
        return hash.SequenceEqual(newHash);
    }
}