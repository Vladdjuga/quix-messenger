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

        if (!userContacts.Any())
            return Result<IEnumerable<ReadContactDto>>.Success([]);

        var mapped = _mapper.Map<IEnumerable<ReadContactDto>>(userContacts, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<IEnumerable<ReadContactDto>>.Success(mapped);
    }
}