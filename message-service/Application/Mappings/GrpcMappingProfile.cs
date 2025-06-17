using Application.DTOs;
using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using AutoMapper;
using Google.Protobuf.WellKnownTypes;
using Messenger;

namespace Application.Mappings;

public class GrpcMappingProfile:Profile
{
    public GrpcMappingProfile()
    {
        CreateMap<SendMessageRequest, CreateMessageCommand>()
            .ForMember(dest=>dest.UserId,
                opt=>opt.MapFrom(src=> src.UserId))
            .ForMember(dest=>dest.Text,
                opt=>opt.MapFrom(src=>src.Text))
            .ForMember(dest=>dest.ChatId,
                opt=>opt.MapFrom(src=> src.ChatId))
            .ForMember(dest=>dest.SentAt,
                opt=>opt.MapFrom(src=>src.SentAt));
        CreateMap<GetMessageRequest, GetMessagesQuery>()
            .ForMember(dest => dest.UserId,
                opt => opt.MapFrom(src => 
                    string.IsNullOrWhiteSpace(src.UserId) ? (Guid?)null : new Guid(src.UserId)))
            .ForMember(dest => dest.ChatId,
                opt => opt.MapFrom(src => 
                    string.IsNullOrWhiteSpace(src.ChatId) ? (Guid?)null : new Guid(src.ChatId)))
            .ForMember(dest => dest.Count,
                opt => opt.MapFrom(src => src.Count));
        CreateMap<ReadMessageDto, MessageResponse>()
            .ForMember(dest => dest.SentAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.SentAt.ToUniversalTime())))
            .ForMember(dest => dest.ReceivedAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.ReceivedAt.ToUniversalTime())));

    }
}