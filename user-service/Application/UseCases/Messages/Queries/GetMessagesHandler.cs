using Application.Common;
using Application.DTOs.Message;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Queries;

public class GetMessagesHandler : IRequestHandler<GetMessagesQuery, Result<IEnumerable<ReadMessageDto>>>
{
    private readonly IMapper _mapper;
    private readonly IMessageRepository _repository;
    private readonly IUserChatRepository _userChatRepository;

    public GetMessagesHandler(IMessageRepository repository, IMapper mapper, IUserChatRepository userChatRepository)
    {
        _repository = repository;
        _mapper = mapper;
        _userChatRepository = userChatRepository;
    }

    public async Task<Result<IEnumerable<ReadMessageDto>>> Handle(GetMessagesQuery request,
        CancellationToken cancellationToken)
    {
        if (request.Count <= 0)
            return Result<IEnumerable<ReadMessageDto>>.Failure("Request is empty");
        var membership = await _userChatRepository.GetByUserAndChatAsync(request.UserId,
            request.ChatId, cancellationToken);
        if (membership is null)
            return Result<IEnumerable<ReadMessageDto>>.Failure("User is not a member of the chat");
        var messages = await _repository
            .GetMessagesAsync(request.ChatId, request.Count, cancellationToken);
        return Result<IEnumerable<ReadMessageDto>>
            .Success(_mapper.Map<IEnumerable<ReadMessageDto>>(messages));
    }
}