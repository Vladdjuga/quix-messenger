namespace Application.Interfaces.Security;

public interface IStringHasher
{
    string Hash(string str);
    bool Verify(string str, string hashedStr);
}