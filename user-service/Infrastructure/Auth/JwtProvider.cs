using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Application.Auth;
using Application.Utilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Auth;

public class JwtProvider:IJwtProvider
{
    private readonly IConfiguration _config;
    private readonly JwtSettings _jwtSettings;

    public JwtProvider(IConfiguration config, IOptions<JwtSettings> jwtSettings)
    {
        _config = config;
        _jwtSettings = jwtSettings.Value;
    }
    public string GenerateToken(Guid userSubject, string userName, string userEmail,Guid sessionId)
    {
        var claims = new List<Claim>
        {
            new (JwtRegisteredClaimNames.Sub, userSubject.ToString()),
            new (JwtRegisteredClaimNames.Email, userEmail),
            new (JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new (JwtRegisteredClaimNames.UniqueName, userName),
            new (JwtCustomClaimNames.Session, sessionId.ToString())
        };
        var audiences=_config.GetSection("JwtSettings:Audiences")
            .Get<List<string>>();
        if (audiences?.Count > 0)
        {
            foreach (var audience in audiences)
            {
                if (!string.IsNullOrEmpty(audience))
                    claims.Add(new Claim(JwtRegisteredClaimNames.Aud, audience!));
            }
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}