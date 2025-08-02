using Application.Common;
using Application.DTOs.Auth;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.Auth.InvalidateToken;

public class InvalidateTokenHandler:IRequestHandler<InvalidateTokenCommand, IResult>
{
    private readonly IUserSessionRepository _userSessionRepository;
    public InvalidateTokenHandler(IUserSessionRepository userSessionRepository)
    {
        _userSessionRepository = userSessionRepository;
    }
    public async Task<IResult> Handle(InvalidateTokenCommand request, CancellationToken cancellationToken)
    {
        var session = await _userSessionRepository.GetByIdAsync(request.SessionId, cancellationToken);
        if (session is null)
            return Result.Failure("Failed to find session");
        
        session.IsActive = false;
        await _userSessionRepository.UpdateAsync(session, cancellationToken);
        
        return Result.Success();
    }
}