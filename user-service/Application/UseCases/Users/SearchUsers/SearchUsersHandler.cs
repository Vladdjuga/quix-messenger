using Application.Common;
using Application.DTOs.User;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.SearchUsers;

public class SearchUsersHandler : IRequestHandler<SearchUsersQuery, Result<IEnumerable<ReadUserDto>>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public SearchUsersHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ReadUserDto>>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        // Trim and validate the query
        var pageSize = request.PageSize;
        if (request.PageSize <= 0)
            pageSize = 10;
        
        var users = await _userRepository.SearchUsersByUsernameAsync(
            request.Query.Trim(),
            request.LastCreatedAt,
            pageSize,
            cancellationToken,
            request.ExcludeUserId);
        var result = _mapper.Map<IEnumerable<ReadUserDto>>(users);
        return Result<IEnumerable<ReadUserDto>>.Success(result);
    }
}
