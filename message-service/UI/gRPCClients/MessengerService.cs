using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using Application.Utilities;
using AutoMapper;
using Google.Protobuf.Collections;
using Grpc.Core;
using MediatR;
using Messenger;
using Microsoft.AspNetCore.Authorization;

namespace UI.gRPCClients;

public class MessengerService : Messenger.Messenger.MessengerBase
{
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public MessengerService(IMediator mediator, ILogger<MessengerService> logger, IMapper mapper)
    {
        _mediator = mediator;
        _logger = logger;
        _mapper = mapper;
    }
    [Authorize]
    public override async Task<SendMessageResponse?> SendMessage(SendMessageRequest request,
        ServerCallContext context)
    {
        try
        {
            var userGuid = GuidParser.SafeParse(request.UserId);
            var chatGuid = GuidParser.SafeParse(request.ChatId);
            if (chatGuid == null || userGuid == null)
            {
                _logger.LogError("Invalid chatId or userGuid");
                return null;
            }
            var command = new CreateMessageCommand(
                request.Text,
                userGuid.Value,
                chatGuid.Value,
                request.SentAt.ToDateTime()
            );
            _logger.LogInformation("(gRPC) Starting to create message by user {UserId}.", request.UserId);
            var response = await _mediator.Send(command, context.CancellationToken);
            if (response.IsFailure)
            {
                _logger.LogError("(gRPC) Failed to create message by user {UserId}.", request.UserId);
                return null;
            }

            _logger.LogInformation("(gRPC) Message {id} created by {UserId}.", response.Value, request.UserId);
            var responseDto = new SendMessageResponse
            {
                Id = response.ToString(),
                Success = true
            };
            return responseDto;
        }
        catch (Exception ex)
        {
            _logger.LogError("(gRPC) Failed to create message by user {UserId}.", request.UserId);
            _logger.LogError("(gRPC) Error : {Error}", ex.Message);
            return null;
        }
    }
    [Authorize]
    public override async Task<GetMessageResponse?> GetMessage(GetMessageRequest request,
        ServerCallContext context)
    {
        try
        {
            var userGuid = GuidParser.SafeParse(request.UserId);
            var chatGuid = GuidParser.SafeParse(request.ChatId);
            var command = new GetMessagesQuery(
                chatGuid,
                userGuid,
                request.Count);
            _logger.LogInformation("(gRPC) Starting to Get {Count} messages by user {UserId}.", request.Count,
                request.UserId);
            var response = await _mediator.Send(command, context.CancellationToken);
            if (response.IsFailure)
            {
                _logger.LogError("(gRPC) Failed to Get messages by user {UserId}.", request.UserId);
                return null;
            }
            _logger.LogInformation("(gRPC) Queried {Count} were returned to {UserId}.", request.Count, request.UserId);
            var responseDto = new GetMessageResponse();
            responseDto.Messages.AddRange(_mapper.Map<IEnumerable<MessageResponse>>(response.Value));
            return responseDto;
        }
        catch (Exception ex)
        {
            _logger.LogError("(gRPC) Failed to query messages.");
            _logger.LogError("(gRPC) Error : {Error}", ex.Message);
            return null;
        }
    }
}