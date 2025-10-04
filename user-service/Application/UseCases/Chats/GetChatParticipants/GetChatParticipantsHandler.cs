using Application.Common;
using Application.DTOs.Chat;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.GetChatParticipants;

public class GetChatParticipantsHandler : IRequestHandler<GetChatParticipantsQuery, Result<IEnumerable<ChatParticipantDto>>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IMapper _mapper;

    public GetChatParticipantsHandler(
        IChatRepository chatRepository,
        IUserChatRepository userChatRepository,
        IMapper mapper)
    {
        _chatRepository = chatRepository;
        _userChatRepository = userChatRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ChatParticipantDto>>> Handle(
        GetChatParticipantsQuery request,
        CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result<IEnumerable<ChatParticipantDto>>.Failure("Chat not found");

        // Check if initiator is in the chat
        var initiatorInChat = await _userChatRepository.AnyByIdAsync(
            request.InitiatorUserId, request.ChatId, cancellationToken);
        
        if (!initiatorInChat)
            return Result<IEnumerable<ChatParticipantDto>>.Failure("You are not a member of this chat");

        var participants = await _userChatRepository.GetParticipantsByChatIdAsync(
            request.ChatId, cancellationToken);

        var participantDtos = participants
            .Where(uc => uc.User != null)
            .Select(uc => new ChatParticipantDto
            {
                UserId = uc.UserId,
                Username = uc.User!.Username,
                Email = uc.User!.Email,
                ChatRole = uc.ChatRole,
                AvatarUrl = uc.User!.AvatarUrl
            });

        return Result<IEnumerable<ChatParticipantDto>>.Success(participantDtos);
    }
}
