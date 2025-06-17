using System.Collections;
using Application.UseCases.Messages.Queries;
using AutoMapper;
using Domain.Repositories;
using Moq;

namespace Tests.UseCases;

public class GetMessagesCommandData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[]{new GetMessagesQuery(Guid.Empty, Guid.Empty, 1)};
        yield return new object[]{new GetMessagesQuery(Guid.NewGuid(), Guid.Empty, 5)};
        yield return new object[]{new GetMessagesQuery(Guid.Empty, Guid.NewGuid(), 5)};
        yield return new object[]{new GetMessagesQuery(Guid.Empty, Guid.NewGuid(), 0)};
        yield return new object[]{new GetMessagesQuery(Guid.Empty, Guid.NewGuid(), -5)};
    }
    IEnumerator IEnumerable.GetEnumerator()=>GetEnumerator();
}
public class GetMessagesHandlerTests
{
    [Theory]
    [ClassData(typeof(GetMessagesCommandData))]
    public async Task Handle_GetMessages_WhenDataIsValid(GetMessagesQuery query)
    {
        //Arrange
        var msgRepoMock = new Mock<IMessageRepository>();
        msgRepoMock.Setup(r => r.GetMessagesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(),
            It.IsAny<int>(), It.IsAny<CancellationToken>()));
        var mapperMock = new Mock<IMapper>();
        var handler = new GetMessagesHandler(msgRepoMock.Object,mapperMock.Object);
        //Act
        await handler.Handle(query, CancellationToken.None);
        //Assert
        msgRepoMock.Verify(r => r.GetMessagesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(),
            It.IsAny<int>(), It.IsAny<CancellationToken>()),Times.Once);
    }
    [Theory]
    [ClassData(typeof(GetMessagesCommandData))]
    public async Task Handle_GetMessages_WhenCountIsZeroOrNegative_ThrowsException(GetMessagesQuery query)
    {
        //Arrange
        var msgRepoMock = new Mock<IMessageRepository>();
        var mapperMock = new Mock<IMapper>();
        var handler = new GetMessagesHandler(msgRepoMock.Object,mapperMock.Object);
        //Act
        //Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
        {
            await handler.Handle(query, CancellationToken.None);
        });
    }
}