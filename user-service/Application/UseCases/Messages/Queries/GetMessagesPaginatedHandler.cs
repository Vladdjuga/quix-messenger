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

    public GetMessagesPaginatedHandler(IMapper mapper, IMessageRepository repository)
    {
        _mapper = mapper;
        _repository = repository;
    }

    public async Task<Result<IEnumerable<ReadMessageDto>>> Handle(GetMessagesPaginatedQuery request, CancellationToken cancellationToken)
    {
        if (request.PageSize <= 0)
            return Result<IEnumerable<ReadMessageDto>>.Failure("Request is empty");
        var messages = await _repository
            .GetMessagesPaginatedAsync(request.UserId, request.ChatId,
                request.LastCreatedAt, request.PageSize, cancellationToken);
        return Result<IEnumerable<ReadMessageDto>>
            .Success(_mapper.Map<IEnumerable<ReadMessageDto>>(messages));
    }
}
