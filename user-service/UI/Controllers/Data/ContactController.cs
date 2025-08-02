﻿using System.IdentityModel.Tokens.Jwt;
using Application.DTOs.Contact;
using Application.UseCases.Contacts.ChangeContactStatus;
using Application.UseCases.Contacts.CreateContact;
using Application.UseCases.Contacts.GetContact;
using Application.UseCases.Contacts.GetUsersContacts;
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
    [HttpPost("addContact/{contactId:guid}")]
    public async Task<Results<Ok<ReadContactDto>,BadRequest<string>,UnauthorizedHttpResult>> CreateContactById(Guid contactId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new CreateContactCommand(
            userGuid,
            contactId
        );
        _logger.LogInformation("Creating contact {ContactId}", contactId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to create contact for {UserId} and {ContactId}",
                userGuid, contactId);
            _logger.LogError("Error: {Error}", result.Error);
            return TypedResults.BadRequest(result.Error);
        }
        _logger.LogInformation("Created contact {ContactId}", contactId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getContact/{contactId:guid}")]
    public async Task<Results<Ok<ReadContactDto>,BadRequest<string>,UnauthorizedHttpResult>> GetContactById(
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
            return TypedResults.BadRequest(result.Error);
        }
        _logger.LogInformation("Retrieved contact {ContactId}", contactId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getContacts")]
    public async Task<Results<Ok<IEnumerable<ReadContactDto>>, 
        BadRequest<string>,UnauthorizedHttpResult>> GetContacts()
    {
        var userGuid = HttpContext.GetUserGuid();

        var query = new GetUsersContactsQuery(userGuid);
        _logger.LogInformation("Getting contacts for {UserId}", userGuid);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error getting contacts for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return TypedResults.BadRequest(result.Error);
        }
        _logger.LogInformation("Retrieved contacts for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpPatch("changeContactStatus{contactId:guid}/{status}")]
    public async Task<Results<Ok, BadRequest<string>,UnauthorizedHttpResult>> ChangeContactStatus(Guid contactId,
        ContactStatus status)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new ChangeContactStatusCommand(
            userGuid,
            contactId,
            status
        );
        _logger.LogInformation("Changing contact status to {Status}", status);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Error changing status for contact : {ContactId}", contactId);
            _logger.LogError("Error: {Error}", result.Error);
            return TypedResults.BadRequest(result.Error);
        }
        _logger.LogInformation("Successfully changed contact status to {Status}", status);
        return TypedResults.Ok();
    }
}