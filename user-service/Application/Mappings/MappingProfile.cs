using Application.DTOs.Chat;
using Application.DTOs.Friendship;
using Application.DTOs.User;
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
        //Make sure to Include Friends when mapping this
        CreateMap<FriendshipEntity, ReadFriendshipDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.PrivateChatId, opt => opt.MapFrom(src => src.PrivateChatId))
            .ForMember(dest => dest.Id, opt => opt.MapFrom((src, _, __, ctx) =>
            {
                Guid? currentUserId = ctx.Items.ContainsKey("CurrentUserId") ? (Guid?)ctx.Items["CurrentUserId"] : null;
                var other = currentUserId.HasValue
                    ? (src.UserId == currentUserId ? src.Friend : src.User)
                    : (src.Friend ?? src.User);
                return other != null ? other.Id : Guid.Empty;
            }))
            .ForMember(dest => dest.Username, opt => opt.MapFrom((src, _, __, ctx) =>
            {
                Guid? currentUserId = ctx.Items.ContainsKey("CurrentUserId") ? (Guid?)ctx.Items["CurrentUserId"] : null;
                var other = currentUserId.HasValue
                    ? (src.UserId == currentUserId ? src.Friend : src.User)
                    : (src.Friend ?? src.User);
                return other != null ? other.Username : string.Empty;
            }))
            .ForMember(dest => dest.Email, opt => opt.MapFrom((src, _, __, ctx) =>
            {
                Guid? currentUserId = ctx.Items.ContainsKey("CurrentUserId") ? (Guid?)ctx.Items["CurrentUserId"] : null;
                var other = currentUserId.HasValue
                    ? (src.UserId == currentUserId ? src.Friend : src.User)
                    : (src.Friend ?? src.User);
                return other != null ? other.Email : string.Empty;
            }))
            .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom((src, _, __, ctx) =>
            {
                Guid? currentUserId = ctx.Items.ContainsKey("CurrentUserId") ? (Guid?)ctx.Items["CurrentUserId"] : null;
                var other = currentUserId.HasValue
                    ? (src.UserId == currentUserId ? src.Friend : src.User)
                    : (src.Friend ?? src.User);
                return other != null ? other.DateOfBirth : DateTime.MinValue;
            }));
    }
}