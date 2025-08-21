using Application.Common;
using Application.DTOs.Contact;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Contacts.RequestFriendship;

public class RequestFriendshipHandler
    : IRequestHandler<RequestFriendshipCommand, Result<ReadContactDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUserContactRepository _userContactRepository;
    private readonly IMapper _mapper;

    public RequestFriendshipHandler(
        IUserRepository userRepository,
        IUserContactRepository userContactRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _userContactRepository = userContactRepository;
        _mapper = mapper;
    }

    public async Task<Result<ReadContactDto>> Handle(RequestFriendshipCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<ReadContactDto>.Failure("User does not exist");
        
        var contact = await _userRepository.GetByUserNameAsync(
            request.ContactUsername, cancellationToken);
        
        if (contact is null)
            return Result<ReadContactDto>.Failure("Contact does not exist");

        var existing = await _userContactRepository.GetUserContactAsync(
            request.UserId, contact.Id, cancellationToken);
        if (existing is not null)
            return Result<ReadContactDto>.Failure("User contact already exists");

        var pending = new UserContactEntity
        {
            UserId = request.UserId,
            ContactId = contact.Id,
            ContactStatus = ContactStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            PrivateChatId = Guid.Empty
        };

        await _userContactRepository.AddAsync(pending, cancellationToken);

        var loadedContact = await _userContactRepository.GetByIdAsync(
            pending.Id,
            cancellationToken,
            include => include.Include(x => x.Contact));

        var dto = _mapper.Map<ReadContactDto>(loadedContact);
        return Result<ReadContactDto>.Success(dto);
    }
}


