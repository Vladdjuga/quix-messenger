using Application.DTOs.Chat;
using Application.DTOs.Friendship;
using Application.DTOs.User;
using Application.DTOs.Message;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings;

public class MappingProfile:Profile
{
    public MappingProfile()
    {
        CreateMap<RegisterUserDto, UserEntity>()
            .ForMember(dest=>dest.PasswordHash,opt=>opt.MapFrom(src=>src.Password));
        //
        CreateMap<UserEntity, ReadUserDto>();
        //
        CreateMap<UpdateUserDto, UserEntity>()
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));
        //
        //Make sure to Include Chats (and Users) when mapping this
        CreateMap<UserChatEntity, ReadChatDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ChatId))
            .ForMember(dest => dest.ChatType, opt => opt.MapFrom(src => src.Chat.ChatType))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Chat.Title))
            .ForMember(dest => dest.IsMuted, opt => opt.MapFrom(src => src.IsMuted))
            .ForMember(dest=>dest.ChatRole,opt=>opt.MapFrom(src=>src.ChatRole))
            .ForMember(dest=>dest.CreatedAt,opt=>opt.MapFrom(src=>src.Chat.CreatedAt))
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.Chat.UserChatEntities.Select(uc => uc.User)))
            .ForMember(dest => dest.LastMessage, opt => opt.MapFrom(src => src.Chat.Messages
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefault()));
        
        // Note: FriendshipEntity -> ReadFriendshipDto mapping has been removed
        // All friendship mappings are now done manually for better control and clarity
        
        // Attachments
        CreateMap<MessageAttachmentEntity, MessageAttachmentDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FileName))
            .ForMember(dest => dest.ContentType, opt => opt.MapFrom(src => src.MimeType))
            .ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.FileSize))
            .ForMember(dest=>dest.Url ,opt=>opt.MapFrom(src=>src.FileUrl));
        
        // Messages
        CreateMap<MessageEntity, ReadMessageDto>()
            .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => src.Attachments));
    }
}