using System.Text.Json;
using System.Text.Json.Serialization;
using Application;
using Application.Auth;
using Application.Behaviors;
using Application.DTOs.User;
using Application.Interfaces;
using Application.Interfaces.Events;
using Application.Interfaces.Notification;
using Application.Interfaces.Realtime;
using Application.Interfaces.Security;
using Application.Mappings;
using Application.Services;
using Application.Services.Security;
using Application.UseCases.Chats.CreateChat;
using Application.UseCases.Users.Data;
using Application.UseCases.Users.Data.GetUser;
using Domain.Entities;
using Domain.Repositories;
using FluentValidation;
using Infrastructure.Auth;
using Infrastructure.Configuration;
using Infrastructure.ExceptionHandlers;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Contexts;
using Infrastructure.Persistence.Files;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Services;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.DI;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<MessengerDbContext>(options => 
            options.UseNpgsql(configuration.GetConnectionString("PostgresSQLConnection"),
                    b => b.MigrationsAssembly("Infrastructure")));
        
        services.Configure<JwtSettings>(opt =>
            configuration.GetSection(nameof(JwtSettings)).Bind(opt));

        services.Configure<FileStorageOptions>(
            configuration.GetSection(FileStorageOptions.SectionName));
        
        services.AddSingleton<IAvatarStorageService>(sp =>
        {
            var fileStorageOptions = sp.GetRequiredService<IOptionsSnapshot<FileStorageOptions>>().Value;
            return new AvatarStorageService(fileStorageOptions.AvatarStoragePath, "");
        });
        
        services.AddSingleton<IMessageAttachmentStorageService>(sp =>
        {
            var fileStorageOptions = sp.GetRequiredService<IOptionsSnapshot<FileStorageOptions>>().Value;
            var logger = sp.GetRequiredService<ILogger<MessageAttachmentStorageService>>();
            return new MessageAttachmentStorageService(fileStorageOptions.AvatarStoragePath, "messages", logger);
        });
        
        services.AddScoped<AvatarMigrationService>();
        
        services.Configure<UserDefaultsOptions>(
            configuration.GetSection(UserDefaultsOptions.SectionName));
        
        services.AddScoped<IUserDefaults>(sp =>
            sp.GetRequiredService<IOptionsSnapshot<UserDefaultsOptions>>().Value);
        
        // Comment this if you want to use global exception middleware
        services.AddExceptionHandler<GlobalExceptionHandler>();
        
        services.AddScoped<IUserRepository,UserRepository>();
        services.AddScoped<IChatRepository,ChatRepository>();
        services.AddScoped<IUserSessionRepository,UserSessionRepository>();
        services.AddScoped<IFriendshipRepository,FriendshipRepository>();
        services.AddScoped<IUserChatRepository,UserChatRepository>();
        services.AddScoped<IMessageRepository,MessageRepository>();
        services.AddScoped<IMessageAttachmentRepository,MessageAttachmentRepository>();
        
        // Kafka Producer
        services.AddSingleton<IKafkaProducerService, KafkaProducerService>();
        services.Configure<KafkaTopicsOptions>(
            configuration.GetSection(KafkaTopicsOptions.SectionName)
        );
        
        services.Configure<DefaultJsonSerializerOptions>(options =>
        {
            options.Options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.Options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.Options.Converters.Add(new JsonStringEnumConverter());
        });
        
        // MassTransit with RabbitMQ
        services.Configure<RabbitMqOptions>(
            configuration.GetSection(RabbitMqOptions.SectionName));
        
        services.AddMassTransit(busConfig =>
        {
            // Register consumers here when needed
            // busConfig.AddConsumer<MessageCreatedConsumer>();
            busConfig.UsingRabbitMq((context, cfg) =>
            {
                var rabbitMqOptions = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;
                
                cfg.Host(rabbitMqOptions.Host, rabbitMqOptions.Port, rabbitMqOptions.VirtualHost, h =>
                {
                    h.Username(rabbitMqOptions.Username);
                    h.Password(rabbitMqOptions.Password);
                });
                
                cfg.ConfigureEndpoints(context);
            });
        });
        
        // Event Publisher (abstraction over MassTransit)
        services.AddScoped<IEventPublisher, EventPublisher>();
        
        // Presence Service (in-memory for single instance, consider Redis for multi-instance)
        services.AddSingleton<IPresenceService, PresenceService>();
        
        // Notification Service (uses Kafka)
        services.AddScoped<INotificationService, RealtimeNotificationService>();
        
        services.AddTransient<IStringHasher, Pbkdf2StringHasher>();
        services.AddTransient<IJwtProvider, JwtProvider>();
        
        services.AddValidatorsFromAssemblyContaining<GetUserQueryValidator>();
        
        services.AddTransient(typeof(IPipelineBehavior<,>),typeof(ValidationBehavior<,>));
        
        services.AddTransient(typeof(IPipelineBehavior<,>),typeof(UseCaseExceptionHandlingBehavior<,>));
        
        services.AddAutoMapper(typeof(MappingProfile));
        
        services.AddMediatR(typeof(CreateChatHandler).Assembly);
        
        return services;
    }
}