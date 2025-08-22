using Application.Common;
using Application.DTOs.Contact;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Contacts.SearchUsersContacts;

public class SearchUsersContactsHandler: 
    IRequestHandler<SearchUsersContactsQuery,Result<IEnumerable<ReadContactDto>>>
{
    private readonly IUserContactRepository _userContactRepository;
    private readonly IMapper _mapper;

    public SearchUsersContactsHandler(IUserContactRepository userContactRepository, IMapper mapper)
    {
        _userContactRepository = userContactRepository;
        _mapper = mapper;
    }
    public async Task<Result<IEnumerable<ReadContactDto>>> Handle(SearchUsersContactsQuery request, CancellationToken cancellationToken)
    {
        var userContacts = await _userContactRepository
            .SearchContactsByUsernameAsync(
                request.UserId,
                request.Query,
                request.LastCreatedAt,
                request.PageSize,
                request.TargetStatus,
                cancellationToken);

        return !userContacts.Any() ?
            Result<IEnumerable<ReadContactDto>>.Success([]) : // return empty list if no contacts found
            Result<IEnumerable<ReadContactDto>>.Success(_mapper.Map<IEnumerable<ReadContactDto>>(userContacts));
    }
}