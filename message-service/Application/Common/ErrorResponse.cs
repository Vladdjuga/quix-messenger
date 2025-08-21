using System.Text.Json.Serialization;

namespace Application.Common;

public class ErrorResponse
{
    [JsonPropertyName("message")]
    public string Message { get; }

    public ErrorResponse(string message)
    {
        Message = message;
    }

}
