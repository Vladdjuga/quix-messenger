using Application.Common;
using Application.DTOs.Chat;
using Application.DTOs.Message;
using Application.DTOs.User;
using AutoMapper;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.GetChats;

public class GetChatsByUserIdHandler:IRequestHandler<GetChatsByUserIdQuery, Result<IEnumerable<ReadChatDto>>>
{
    private readonly IUserChatRepository _userChatRepository;
    private readonly IMapper _mapper;

    public GetChatsByUserIdHandler(IUserChatRepository userChatRepository, IMapper mapper)
    {
        _userChatRepository = userChatRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ReadChatDto>>> Handle(GetChatsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var userChats = await _userChatRepository.GetChatsByUserIdAsync(request.UserId,
            true,
            cancellationToken);
        // Manually map to ensure LastMessage is populated from included Messages
        var chats = userChats
            .Where(uc => uc.Chat != null)
            .Select(uc => new ReadChatDto
            {
                Id = uc.ChatId,
                Title = uc.Chat!.Title,
                IsPrivate = uc.Chat!.IsPrivate,
                ChatType = uc.Chat!.ChatType,
                IsMuted = uc.IsMuted,
                ChatRole = uc.ChatRole,
                CreatedAt = uc.Chat!.CreatedAt,
                Participants = uc.Chat!.UserChatEntities
                    .Where(p => p.User != null)
                    .Select(p => _mapper.Map<ReadUserDto>(p.User!))
                    .ToList(),
                LastMessage = uc.Chat!.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => _mapper.Map<ReadMessageDto>(m))
                    .FirstOrDefault()
            })
            .ToList();

        return Result<IEnumerable<ReadChatDto>>.Success(chats);
    }
}