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
        //Make sure to Include Chats when mapping this
        CreateMap<UserChatEntity, ReadChatDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ChatId))
            .ForMember(dest => dest.ChatType, opt => opt.MapFrom(src => src.Chat.ChatType))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Chat.Title))
            .ForMember(dest => dest.IsMuted, opt => opt.MapFrom(src => src.IsMuted))
            .ForMember(dest=>dest.ChatRole,opt=>opt.MapFrom(src=>src.ChatRole))
            .ForMember(dest=>dest.CreatedAt,opt=>opt.MapFrom(src=>src.Chat.CreatedAt))
            .ForMember(dest=>dest.IsPrivate,opt=>opt.MapFrom(src=>src.Chat.IsPrivate));
        
        // Note: FriendshipEntity -> ReadFriendshipDto mapping has been removed
        // All friendship mappings are now done manually for better control and clarity

        // Messages
        CreateMap<MessageEntity, ReadMessageDto>();
    }
}