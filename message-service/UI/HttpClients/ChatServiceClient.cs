using System.Net.Http.Headers;
using System.Text.Json;

namespace UI.HttpClients;

public class ChatMembershipResponse
{
    public bool IsUserInChat { get; init; }
}

public class ChatServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ChatServiceClient> _logger;

    public ChatServiceClient(HttpClient httpClient, IConfiguration configuration, ILogger<ChatServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> IsUserInChatAsync(string userId, string chatId,
        string bearerToken, CancellationToken cancellationToken = default)
    {
        try
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"/api/Chat/isUserInChat?userId={userId}&chatId={chatId}");

            request.Headers.Authorization = 
                new AuthenticationHeaderValue("Bearer", bearerToken);

            _logger.LogInformation("Sending {HttpMethod} request to {RequestUri} to check user chat membership",
                request.Method, request.RequestUri);
            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to check user chat membership. Status: {StatusCode}", response.StatusCode);
                return false;
            }
            _logger.LogInformation("Received successful response from chat service");

            var result = await response.Content.ReadFromJsonAsync<ChatMembershipResponse>(
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                cancellationToken);

            return result?.IsUserInChat ?? false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking user chat membership");
            return false;
        }
    }
}
