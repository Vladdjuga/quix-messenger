using Application.DTOs;
using Application.UseCases.Messages;
using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using Carter;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using UI.Common;
using Application.Common;

namespace UI.Endpoints;

/// <summary>
/// This is an MinAPI REST module for managing messages.
/// </summary>
public class MessageEndpoints:ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/Messages");
        group.MapGet("", GetMessages).RequireAuthorization();
        group.MapPost("add", AddMessage).RequireAuthorization();
    }
    /// <summary>
    /// This method will add a message to the database.
    /// </summary>
    /// <param name="request">This is a message DTO that will be then converted to a command</param>
    /// <param name="mediator">This is a mediator that will be injected using DI</param>
    /// <param name="logger">This is a logger that will be injected using DI</param>
    /// <returns>Guid or bad request if exception was thrown</returns>
    private static async Task<Results<Ok<Guid>,BadRequest<ErrorResponse>>> AddMessage(
        [FromBody] CreateMessageRequest request,
        IMediator mediator,
        ILogger<MessageEndpoints> logger)
    {
        try
        {
            var command = new CreateMessageCommand
            (
                Text : request.Text,
                UserId : request.UserId,
                ChatId : request.ChatId,
                SentAt : DateTime.UtcNow
            );
            logger.LogInformation("Starting to create message by user {UserId}.",request.UserId);
            var result=await mediator.Send(command);
            if (result.IsFailure)
            {
                logger.LogError(result.Error, "Failed to create message.");
                return ErrorResult.Create(result.Error);
            }
            logger.LogInformation("Message {id} created by {UserId}.", result.Value, request.UserId);
            return TypedResults.Ok(result.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create message. Error : {ErrorMessage}", ex.Message);
            return ErrorResult.Create("Failed to create message.");
        }
    }
    /// <summary>
    /// This method will return messages.
    /// </summary>
    /// <param name="request">This is a request DTO,</param>
    /// <param name="mediator">This is a mediator that will be injected using DI</param>
    /// <param name="logger">This is a logger that will be injected using DI</param>
    /// <returns>ReadMessageDto`s or bad request if exception was thrown</returns>
    private static async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>>> GetMessages(
        [AsParameters] GetMessagesRequest request
        , IMediator mediator,
        ILogger<MessageEndpoints> logger)
    {
        try
        {
            var query = new GetMessagesQuery(
                ChatId:request.ChatId,
                UserId:request.UserId,
                Count:request.Count
            );
            logger.LogInformation("Starting to query {Count} messages for user {UserId} and chat {ChatId}",
                request.Count, request.UserId, request.ChatId);
            var result = await mediator.Send(query);
            if (result.IsFailure)
            {
                logger.LogError(result.Error,"Failed to query messages.");
                return ErrorResult.Create(result.Error);
            }
            logger.LogInformation("Queried {Count} were returned to {UserId}.",request.Count, request.UserId);
            return TypedResults.Ok(result.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get messages. Error : {ErrorMessage}", ex.Message);
            return ErrorResult.Create("Failed to get messages");
        }
    }
}