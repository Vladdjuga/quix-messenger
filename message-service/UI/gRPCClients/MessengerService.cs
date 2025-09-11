using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using Application.Utilities;
using AutoMapper;
using Google.Protobuf.Collections;
using Grpc.Core;
using MediatR;
using Messenger;
using Microsoft.AspNetCore.Authorization;
using UI.Utilities;

namespace UI.gRPCClients;

public class MessengerService : Messenger.Messenger.MessengerBase
{
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;
    private readonly ILogger _logger;
    private readonly ChatServiceClient _chatServiceClient;

    public MessengerService(IMediator mediator, ILogger<MessengerService> logger, IMapper mapper, ChatServiceClient chatServiceClient)
    {
        _mediator = mediator;
        _logger = logger;
        _mapper = mapper;
        _chatServiceClient = chatServiceClient;
    }
    [Authorize]
    public override async Task<SendMessageResponse?> SendMessage(SendMessageRequest request,
        ServerCallContext context)
    {
        try
        {
            // Get authenticated user ID from context instead of trusting the request
            var authenticatedUserId = context.GetAuthenticatedUserId();
            if (authenticatedUserId == null)
            {
                _logger.LogError("(gRPC) User not authenticated");
                return null;
            }

            var chatGuid = GuidParser.SafeParse(request.ChatId);
            if (chatGuid == null)
            {
                _logger.LogError("(gRPC) Invalid chatId");
                return null;
            }

            // Verify user is member of the chat
            var bearerToken = context.GetBearerToken();
            if (string.IsNullOrEmpty(bearerToken))
            {
                _logger.LogError("(gRPC) Bearer token not found in request");
                return null;
            }

            var isUserInChat = await _chatServiceClient.IsUserInChatAsync(
                authenticatedUserId.ToString()!, 
                request.ChatId,
                bearerToken,
                context.CancellationToken);
            
            if (!isUserInChat)
            {
                _logger.LogError("(gRPC) User {UserId} is not a member of chat {ChatId}", authenticatedUserId, request.ChatId);
                return null;
            }

            var command = new CreateMessageCommand(
                request.Text,
                authenticatedUserId.Value, // Use authenticated user ID
                chatGuid.Value,
                request.SentAt.ToDateTime()
            );
            _logger.LogInformation("(gRPC) Starting to create message by user {UserId}.", authenticatedUserId);
            var response = await _mediator.Send(command, context.CancellationToken);
            if (response.IsFailure)
            {
                _logger.LogError("(gRPC) Failed to create message by user {UserId}.", authenticatedUserId);
                return null;
            }

            _logger.LogInformation("(gRPC) Message {id} created by {UserId}.", response.Value, authenticatedUserId);
            var responseDto = new SendMessageResponse
            {
                Id = response.ToString(),
                Success = true
            };
            return responseDto;
        }
        catch (Exception ex)
        {
            _logger.LogError("(gRPC) Failed to create message.");
            _logger.LogError("(gRPC) Error : {Error}", ex.Message);
            return null;
        }
    }
}