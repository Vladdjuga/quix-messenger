using Application.Common;
using Application.DTOs.Message;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Queries;

public class GetMessagesPaginatedHandler : IRequestHandler<GetMessagesPaginatedQuery, Result<IEnumerable<ReadMessageDto>>>
{
    private readonly IMapper _mapper;
    private readonly IMessageRepository _repository;
    private readonly IUserChatRepository _userChatRepository;

    public GetMessagesPaginatedHandler(IMapper mapper, IMessageRepository repository, IUserChatRepository userChatRepository)
    {
        _mapper = mapper;
        _repository = repository;
        _userChatRepository = userChatRepository;
    }

    public async Task<Result<IEnumerable<ReadMessageDto>>> Handle(GetMessagesPaginatedQuery request, CancellationToken cancellationToken)
    {
        if (request.PageSize <= 0)
            return Result<IEnumerable<ReadMessageDto>>.Failure("Request is empty");
        // Membership check
        var membership = await _userChatRepository.GetByUserAndChatAsync(request.UserId, request.ChatId, cancellationToken);
        if (membership is null)
            return Result<IEnumerable<ReadMessageDto>>.Failure("User is not a member of the chat");
        var messages = await _repository
            .GetMessagesPaginatedAsync(request.ChatId,
                request.LastCreatedAt, request.PageSize, cancellationToken);
        return Result<IEnumerable<ReadMessageDto>>
            .Success(_mapper.Map<IEnumerable<ReadMessageDto>>(messages));
    }
}
