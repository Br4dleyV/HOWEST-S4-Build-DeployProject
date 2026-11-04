using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Shared;

public sealed class BaseDomainEventTests
{
    [Fact]
    public void Constructor_WithDefaults_ShouldSetFqdn()
    {
        // Arrange
        const string eventName = "Created";
        const string aggregateName = "Aggregate";

        // Act
        BaseDomainEvent domainEvent = new(eventName, aggregateName);

        // Assert
        Assert.Equal("Howestprime.Movies.Aggregate.Created", domainEvent.FQDN);
    }

    [Fact]
    public void Constructor_ShouldSetOccurredOn()
    {
        // Arrange
        DateTime before = DateTime.UtcNow;

        // Act
        BaseDomainEvent domainEvent = new("Created", "Aggregate");
        DateTime after = DateTime.UtcNow;

        // Assert
        Assert.InRange(domainEvent.OccurredOn, before, after);
    }
}
