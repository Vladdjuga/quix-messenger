using Application.Common;
using Application.DTOs.User;
using MediatR;

namespace Application.UseCases.Users.SearchUsers;

public record SearchUsersQuery(
    string Query,
    DateTime? LastCreatedAt,
    int PageSize,
    Guid? ExcludeUserId = null) : IRequest<Result<IEnumerable<ReadUserDto>>>;
