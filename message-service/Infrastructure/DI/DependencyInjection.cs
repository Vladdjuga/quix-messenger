using Application.Behaviors;
using Application.Common;
using Application.Mappings;
using Application.UseCases.Messages;
using Application.UseCases.Messages.Commands;
using Domain.Repositories;
using FluentValidation;
using Infrastructure.Persistence.Mongo;
using Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;
using MediatR;
namespace Infrastructure.DI;

public static class DependencyInjection
{
    public static void ConfigureServices(this IServiceCollection services)
    {
        services.AddSingleton<MongoDbContext>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddMediatR(typeof(AssemblyMarker).Assembly);
        services.AddValidatorsFromAssemblyContaining<CreateMessageCommandValidator>();
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddAutoMapper(typeof(MappingProfile));
    }
}