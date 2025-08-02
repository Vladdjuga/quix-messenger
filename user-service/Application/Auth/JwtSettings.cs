namespace Application.Auth;

public class JwtSettings
{
    public int AccessTokenExpirationMinutes { get; set; }
    public int RefreshTokenExpirationDays { get; set; }
}