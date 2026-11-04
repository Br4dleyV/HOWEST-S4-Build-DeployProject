using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Shared;

public sealed class EntityIdTests
{
    [Fact]
    public void New_WithProvidedGuid_ShouldUseGuid()
    {
        // Arrange
        Guid guid = Guid.NewGuid();

        // Act
        TestId id = EntityId.New<TestId>(guid);

        // Assert
        Assert.Equal(guid, id.Value);
    }

    [Fact]
    public void New_WithoutGuid_ShouldCreateNonEmptyValue()
    {
        // Arrange
        Guid empty = Guid.Empty;

        // Act
        TestId id = EntityId.New<TestId>();

        // Assert
        Assert.NotEqual(empty, id.Value);
    }

    [Fact]
    public void New_WithMissingGuidConstructor_ShouldThrow()
    {
        // Arrange
        Action act = () => EntityId.New<BadId>();

        // Act
        Exception? exception = Record.Exception(act);

        // Assert
        Assert.NotNull(exception);
        Assert.IsType<InvalidOperationException>(exception);
    }

    [Fact]
    public void Equals_WithNull_ShouldReturnFalse()
    {
        // Arrange
        var id = EntityId.New<TestId>();
        var entity = new TestEntity(id);

        // Act
        var result = entity.Equals((object?)null);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Equals_WithDifferentType_ShouldReturnFalse()
    {
        // Arrange
        var id = EntityId.New<TestId>();
        var entity = new TestEntity(id);
        var differentObject = "I am a string, not an entity";

        // Act
        var result = entity.Equals(differentObject);

        // Assert
        Assert.False(result);
    }

    // Simple concrete implementation to test the abstract base
    private class TestEntity(TestId id) : Entity<TestId>(id)
    {
        public override void ValidateState() { }
    }


    public readonly record struct TestId(Guid Value) : IEntityId;

    public readonly record struct BadId(int Number) : IEntityId
    {
        public Guid Value => Guid.Empty;
    }
}
