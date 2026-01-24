using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Notification
{
    // Will be used for publishing events to an event bus or message broker
    // such as RabbitMQ, Kafka, etc.
    internal interface IEventPublisher
    {
       // Task PublishMessageCreatedAsync(MessageCreatedEvent @event, CancellationToken cancellationToken = default);
       // Task PublishMessageDeletedAsync(MessageDeletedEvent @event, CancellationToken cancellationToken = default);
       // Task PublishMessageEditedAsync(MessageEditedEvent @event, CancellationToken cancellationToken = default);
    }
}
