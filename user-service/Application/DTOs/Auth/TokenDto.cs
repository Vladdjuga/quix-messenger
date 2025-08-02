namespace Application.DTOs.Auth;

// This record is used to hold token-related data.
// Contains access and refresh tokens.
// Does not have any methods or properties.
public record TokenDto(string AccessToken, string RefreshToken, DateTime ExpiresAt);