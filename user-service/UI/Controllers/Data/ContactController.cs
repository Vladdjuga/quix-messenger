using System.IdentityModel.Tokens.Jwt;
using Application.Common;
using Application.DTOs.Contact;
using Application.UseCases.Contacts.ChangeContactStatus;
using Application.UseCases.Contacts.AcceptFriendship;
using Application.UseCases.Contacts.CreateContact;
using Application.UseCases.Contacts.RequestFriendship;
using Application.UseCases.Contacts.CreateContactByUsername;
using Application.UseCases.Contacts.GetContact;
using Application.UseCases.Contacts.GetUsersContacts;
using Application.UseCases.Contacts.SearchIncomingFriendRequests;
using Application.UseCases.Contacts.SearchUsersContacts;
using Application.Utilities;
using AutoMapper;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using UI.Attributes;
using UI.Utilities;
using UI.Common;

namespace UI.Controllers.Data;

[Route("api/[controller]")]
public class ContactController:Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public ContactController(IMediator mediator, ILogger<ContactController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Authorize]
    [GetUserGuid]
    [HttpPost("acceptFriendship/{userContactId:guid}")]
    public async Task<Results<Ok<ReadContactDto>,BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> AcceptFriendship(
        Guid userContactId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new AcceptFriendshipCommand(userGuid, userContactId);
        _logger.LogInformation("Accepting friendship {UserContactId}", userContactId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to accept friendship for {UserId} and {UserContactId}",
                userGuid, userContactId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Accepted friendship {UserContactId}", userContactId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getContact/{contactId:guid}")]
    public async Task<Results<Ok<ReadContactDto>,BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetContactById(
        Guid contactId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var query=new GetContactQuery(userGuid,contactId);
        _logger.LogInformation("Getting contact {ContactId}", contactId);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error getting contact {ContactId}", contactId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved contact {ContactId}", contactId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getContacts")]
    public async Task<Results<Ok<IEnumerable<ReadContactDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetContacts(
        [FromQuery] int? pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        // If pageSize is not provided, return all contacts (legacy behavior); otherwise, return paged results
        var query = pageSize.HasValue
            ? new GetUsersContactsQuery(userGuid, lastCreatedAt, pageSize.Value)
            : new GetUsersContactsQuery(userGuid);
        _logger.LogInformation("Getting contacts for {UserId}", userGuid);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error getting contacts for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved contacts for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpGet("searchContacts")]
    public async Task<Results<Ok<IEnumerable<ReadContactDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> SearchContacts(
        [FromQuery] string query,
    [FromQuery] int? pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();
    var size = (pageSize.HasValue && pageSize.Value > 0) ? Math.Min(pageSize.Value, 100) : 20;

        // When query is empty or whitespace, fall back to the regular paginated contacts list
        if (string.IsNullOrWhiteSpace(query))
        {
            var getContactsQuery = new GetUsersContactsQuery(userGuid, lastCreatedAt, size);
            _logger.LogInformation("Query empty. Returning paged contacts for {UserId}", userGuid);
            var contactsResult = await _mediator.Send(getContactsQuery);
            if (contactsResult.IsFailure)
            {
                _logger.LogError("Error getting paged contacts for {UserId}", userGuid);
                _logger.LogError("Error: {Error}", contactsResult.Error);
                return ErrorResult.Create(contactsResult.Error);
            }
            _logger.LogInformation("Retrieved paged contacts for {UserId}", userGuid);
            return TypedResults.Ok(contactsResult.Value);
        }

        var q = new SearchUsersContactsQuery(
            userGuid,
            query,
            ContactStatus.Active, // Only search active contacts
            lastCreatedAt,
            size);
        _logger.LogInformation("Searching contacts for {UserId}", userGuid);
        var result = await _mediator.Send(q);
        if (result.IsFailure)
        {
            _logger.LogError("Error searching contacts for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved searched contacts for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }
    
    [Authorize]
    [GetUserGuid]
    [HttpGet("getFriendRequests")]
    public async Task<Results<Ok<IEnumerable<ReadContactDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetUsersFriendRequests(
        [FromQuery] string query,
        [FromQuery] int pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();

        var q = new SearchIncomingFriendRequestsQuery(
            userGuid,
            query,
            lastCreatedAt,
            pageSize);
        _logger.LogInformation("Searching incoming friend requests for {UserId}", userGuid);
        var result = await _mediator.Send(q);
        if (result.IsFailure)
        {
            _logger.LogError("Error searching incoming friend requests for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved incoming friend requests for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpPatch("changeContactStatus/{contactId:guid}/{status}")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> ChangeContactStatus(Guid contactId,
        ContactStatus status)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new ChangeContactStatusCommand(
            userGuid,
            contactId,
            status
        );
        _logger.LogInformation("Changing contact status to {TargetStatus}", status);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Error changing status for contact : {ContactId}", contactId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Successfully changed contact status to {TargetStatus}", status);
        return TypedResults.Ok();
    }
    [Authorize]
    [GetUserGuid]
    [HttpPost("requestFriendship/{username}")]
    public async Task<Results<Ok<ReadContactDto>,BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> RequestFriendship(
        string username
        )
    {
        var userGuid = HttpContext.GetUserGuid();

        _logger.LogInformation("Requesting friendship by username {Username}", username);
        var command = new RequestFriendshipCommand(userGuid, username);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to request friendship for {Username}", username);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Friendship request created for {Username}", username);
        return TypedResults.Ok(result.Value);
    }
}