using Domain.Enums;
using Application.DTOs.User;
using Application.DTOs.Message;

namespace Application.DTOs.Chat;

public class ReadChatDto
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required bool IsPrivate { get; init; }
    public required ChatType ChatType { get; init; } 
    public required bool IsMuted { get; init; }
    public required ChatRole ChatRole { get; init; }
    public required DateTime CreatedAt { get; init; }
    public IEnumerable<ReadUserDto> Participants { get; init; } = new List<ReadUserDto>();
    public ReadMessageDto? LastMessage { get; init; }
    
}