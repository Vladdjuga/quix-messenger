using Application.Common;
using Application.DTOs.Contact;
using Application.UseCases.Contacts.SearchUsersContacts;
using AutoMapper;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Contacts.GetUsersContacts;

public class GetUsersContactsHandler:
    IRequestHandler<GetUsersContactsQuery,Result<IEnumerable<ReadContactDto>>>
{
    private readonly IUserContactRepository _userContactRepository;
    private readonly IMapper _mapper;

    public GetUsersContactsHandler(IUserContactRepository userContactRepository, IMapper mapper)
    {
        _userContactRepository = userContactRepository;
        _mapper = mapper;
    }
    public async Task<Result<IEnumerable<ReadContactDto>>> Handle(GetUsersContactsQuery request, CancellationToken cancellationToken)
    {
        var userContacts = await _userContactRepository
            .GetAllUsersContactsAsync(request.UserId,
                request.LastCreatedAt,
                request.PageSize,
                cancellationToken);

        if (!userContacts.Any())
            return Result<IEnumerable<ReadContactDto>>.Success([]);

        // Pass current user id so mapper can choose the opposite side
        var mapped = _mapper.Map<IEnumerable<ReadContactDto>>(userContacts, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<IEnumerable<ReadContactDto>>.Success(mapped);
    }
}