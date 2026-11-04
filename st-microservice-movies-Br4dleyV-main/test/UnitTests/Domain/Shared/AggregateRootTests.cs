using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Shared;

public sealed class AggregateRootTests
{
    [Fact]
    public void Constructor_WithoutId_ShouldInitializeDefaultIdAndNoEvents()
    {
        // Arrange
        DefaultAggregate aggregate = new();

        // Act
        TestId id = aggregate.Id;

        // Assert
        Assert.Equal(default, id);
        Assert.Empty(aggregate.DomainEvents);
    }

    [Fact]
    public void RaiseDomainEvent_ShouldAddEvent()
    {
        // Arrange
        TestAggregate aggregate = new(new TestId(Guid.NewGuid()));
        TestDomainEvent domainEvent = new("Created", "Aggregate");

        // Act
        aggregate.AddEvent(domainEvent);

        // Assert
        Assert.Single(aggregate.DomainEvents);
        Assert.Contains(domainEvent, aggregate.DomainEvents);
    }

    [Fact]
    public void ClearDomainEvents_ShouldRemoveAllEvents()
    {
        // Arrange
        TestAggregate aggregate = new(new TestId(Guid.NewGuid()));
        aggregate.AddEvent(new TestDomainEvent("Created", "Aggregate"));
        aggregate.AddEvent(new TestDomainEvent("Updated", "Aggregate"));

        // Act
        aggregate.ClearDomainEvents();

        // Assert
        Assert.Empty(aggregate.DomainEvents);
    }

    public readonly record struct TestId(Guid Value) : IEntityId;

    public sealed class TestAggregate(TestId id) : AggregateRoot<TestId>(id)
    {
        public void AddEvent(TestDomainEvent domainEvent)
        {
            RaiseDomainEvent(domainEvent);
        }

        public override void ValidateState()
        {
        }
    }

    public sealed class TestDomainEvent(string eventName, string aggregateName)
        : BaseDomainEvent(eventName, aggregateName);

    public sealed class DefaultAggregate : AggregateRoot<TestId>
    {
        public override void ValidateState()
        {
        }
    }
}
