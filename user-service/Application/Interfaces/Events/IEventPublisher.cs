namespace Application.Interfaces.Events;

/// <summary>
/// Event publisher abstraction that hides the underlying message broker implementation (MassTransit/RabbitMQ).
/// Allows handlers to publish events without direct dependency on MassTransit.
/// </summary>
public interface IEventPublisher
{
    /// <summary>
    /// Publishes an event to the message broker.
    /// </summary>
    /// <typeparam name="TEvent">The type of event to publish</typeparam>
    /// <param name="event">The event data to publish</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class;
}
