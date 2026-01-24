using Application.DTOs.Message.Realtime;

namespace Application.Interfaces.Realtime;

// Used for chat-related real-time communication
public interface IChatClient
{
    //Task OnJoinChat(Guid chatId);
    //Task OnLeaveChat(Guid chatId);
    //Task OnTyping(Guid chatId, string username);
    //Task OnStopTyping(Guid chatId);
    Task UserTyping(string username, Guid userId); // Notify that a user is typing. ID is needed in case of duplicate usernames.
    Task UserStopTyping(Guid userId);
    
    // Message events (migrated from Kafka/Socket.IO to SignalR)
    Task NewMessage(NewMessageRealtimeDto payload);
    Task MessageEdited(MessageEditedRealtimeDto payload);
    Task MessageDeleted(MessageDeletedRealtimeDto payload);
}