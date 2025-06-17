﻿using Application.DTOs.Chat;
using Application.DTOs.Contact;
using Application.DTOs.User;
using AutoMapper;
using Domain.Entities;
using Domain.ValueObjects;

namespace Application.Mappings;

public class MappingProfile:Profile
{
    public MappingProfile()
    {
        CreateMap<RegisterUserDto, UserEntity>()
            .ForMember(dest=>dest.PasswordHash,opt=>opt.MapFrom(src=>src.Password));
        //
        CreateMap<UserEntity, ReadUserDto>();
        CreateMap<UserEntity, ReadUserPublicDto>();
        //
        CreateMap<string, Email>().ConvertUsing(email => new Email(email));
        CreateMap<Email, string>().ConvertUsing(email => email.Address);
        //
        CreateMap<UpdateUserDto, UserEntity>()
            .ForMember(dest => dest.Email, opt =>
            {
                opt.PreCondition(src => src.Email != null);
                opt.MapFrom(src => new Email(src.Email!));
            })
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
        //Make sure to Include Contacts when mapping this
        CreateMap<UserContactEntity, ReadContactDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ContactId))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.ContactStatus))
            .ForMember(dest => dest.PrivateChatId, opt => opt.MapFrom(src => src.PrivateChatId))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Contact.Email))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Contact.Username))
            .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.Contact.DateOfBirth));
    }
}