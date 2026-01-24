using Application.Interfaces.Realtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using UI.Controllers.Auth;
using UI.Utilities;

namespace UI.Hubs
{
    // Hub for real-time chat functionality
    // Strongly typed to IChatClient for better maintainability
    [Authorize]
    public class ChatHub(ILogger<ChatHub> logger) : Hub<IChatClient>
    {

        public async Task OnJoinChat(Guid chatId)
        {
            if (chatId == Guid.Empty)
            {
                logger.LogWarning("ChatID is empty.");
                return;
            }
            var userId = Context.GetUserGuid();
            logger.LogInformation("Adding user {userId} with connection {connectionId} to chat {chatId}.",
                userId,Context.ConnectionId,chatId);
            await this.Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
        }

        public async Task OnLeaveChat(Guid chatId)
        {
            if (chatId == Guid.Empty)
            {
                logger.LogWarning("ChatID is empty.");
                return;
            }
            var userId = Context.GetUserGuid();
            logger.LogInformation("Removing user {userId} with connection {connectionId} from chat {chatId}.",
                userId, Context.ConnectionId, chatId);
            await this.Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());
        }

        public async Task OnTyping(Guid chatId, string username)
        {
            if (chatId == Guid.Empty || string.IsNullOrWhiteSpace(username))
            {
                logger.LogWarning("ChatID or/and username are empty.\n Values :\n chatId={chatId};\n username={username};",
                    chatId,username);
                return;
            }
            var userId = Context.GetUserGuid();
            logger.LogInformation("Sending UserTyping event to {chatId} group with username{username}, and ID {userId}.",
                chatId, username, chatId);
            await this.Clients.OthersInGroup(chatId.ToString()).UserTyping(username,userId);
        }

        public async Task OnStopTyping(Guid chatId)
        {
            var userId = Context.GetUserGuid();
            await this.Clients.OthersInGroup(chatId.ToString()).UserStopTyping(userId);
        }
    }
}
