using Application.Interfaces.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

/// <summary>
/// Event publisher implementation using MassTransit/RabbitMQ.
/// Provides abstraction layer over MassTransit's IPublishEndpoint.
/// </summary>
public class EventPublisher : IEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<EventPublisher> _logger;

    public EventPublisher(
        IPublishEndpoint publishEndpoint,
        ILogger<EventPublisher> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class
    {
        try
        {
            _logger.LogInformation(
                "Publishing event {EventType} to message broker",
                typeof(TEvent).Name);

            await _publishEndpoint.Publish(@event, cancellationToken);

            _logger.LogInformation(
                "Successfully published event {EventType}",
                typeof(TEvent).Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to publish event {EventType} to message broker",
                typeof(TEvent).Name);
            
            throw;
        }
    }
}
