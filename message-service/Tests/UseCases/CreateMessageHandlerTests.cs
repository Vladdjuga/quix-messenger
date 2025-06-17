using System.Collections;
using Application.UseCases.Messages.Commands;
using Domain.Entities;
using Domain.Repositories;
using Moq;

namespace Tests.UseCases;

public class CreateMessageCommandData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[]{new CreateMessageCommand("Test1",Guid.NewGuid(),
            Guid.NewGuid(),DateTime.Now)};
        yield return new object[]{new CreateMessageCommand(" ",Guid.Empty,
            Guid.NewGuid(),DateTime.Now)};
        yield return new object[]{new CreateMessageCommand("\n",Guid.Empty,
            Guid.Empty,DateTime.Now)};
        yield return new object[]{new CreateMessageCommand("Test2",Guid.NewGuid(),
            Guid.NewGuid(),DateTime.Now)};
        yield return new object[]{new CreateMessageCommand(new string('A',501),Guid.NewGuid(),
            Guid.NewGuid(),DateTime.Now)};
    }
    IEnumerator IEnumerable.GetEnumerator()=>GetEnumerator();
}
public class CreateMessageHandlerTests
{
    [Theory]
    [ClassData(typeof(CreateMessageCommandData))]
    public async Task Handle_CreateMessage_WhenDataIsValid(CreateMessageCommand command)
    {
        //Arrange
        var msgRepoMock = new Mock<IMessageRepository>();
        msgRepoMock.Setup(r=>r.AddMessageAsync(It.IsAny<MessageEntity>()))
            .Returns(Task.CompletedTask);
        var handler = new CreateMessageHandler(msgRepoMock.Object);
        //Act
        await handler.Handle(command, CancellationToken.None);
        //Assert
        msgRepoMock.Verify(r=>r.AddMessageAsync(It.IsAny<MessageEntity>()), Times.Once);
    }
    [Theory]
    [ClassData(typeof(CreateMessageCommandData))]
    public async Task Handle_CreateMessage_WhenDataIsNotValid(CreateMessageCommand command)
    {
        //Arrange
        var msgRepoMock = new Mock<IMessageRepository>();
        var handler = new CreateMessageHandler(msgRepoMock.Object);
        //Act
        //Assert
        await Assert.ThrowsAsync<ArgumentException>(async () => await handler.Handle(command, CancellationToken.None));
    }

    [Theory]
    [ClassData(typeof(CreateMessageCommandData))]
    public async Task Handle_CreateMessage_WhenMessageIsTooLong_ThrowsException(CreateMessageCommand command)
    {
        var msgRepoMock = new Mock<IMessageRepository>();
        var handler = new CreateMessageHandler(msgRepoMock.Object);
        if (command.Text.Length > 500)
        {
            await Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await handler.Handle(command, CancellationToken.None);
            });
        }
        else
        {
            await handler.Handle(command, CancellationToken.None);
            msgRepoMock.Verify(r => r.AddMessageAsync(It.IsAny<MessageEntity>()), Times.Once);
        }
    }
}