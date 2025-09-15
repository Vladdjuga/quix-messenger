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

    public GetMessagesHandler(IMessageRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }
    public async Task<Result<IEnumerable<ReadMessageDto>>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        if (request.Count <= 0)
            return Result<IEnumerable<ReadMessageDto>>.Failure("Request is empty");
        var messages = await _repository
            .GetMessagesAsync(request.UserId, request.ChatId, request.Count, cancellationToken);
        return Result<IEnumerable<ReadMessageDto>>
            .Success(_mapper.Map<IEnumerable<ReadMessageDto>>(messages));
    }
}
