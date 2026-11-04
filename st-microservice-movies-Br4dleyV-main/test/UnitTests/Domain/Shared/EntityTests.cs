using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Shared;

public sealed class EntityTests
{
    [Fact]
    public void Constructor_WithoutId_ShouldInitializeDefaultId()
    {
        // Arrange
        DefaultEntity entity = new();

        // Act
        TestId id = entity.Id;

        // Assert
        Assert.Equal(default, id);
    }

    [Fact]
    public void Equals_WithSameIdAndType_ShouldBeEqual()
    {
        // Arrange
        TestId id = new(Guid.NewGuid());
        TestEntity first = new(id);
        TestEntity second = new(id);

        // Act
        bool equals = first.Equals(second);

        // Assert
        Assert.True(equals);
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
        Assert.True(first == second);
    }

    [Fact]
    public void Equals_WithDifferentId_ShouldNotBeEqual()
    {
        // Arrange
        TestEntity first = new(new TestId(Guid.NewGuid()));
        TestEntity second = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = first.Equals(second);

        // Assert
        Assert.False(equals);
        Assert.True(first != second);
    }

    [Fact]
    public void Equals_WithDifferentType_ShouldNotBeEqual()
    {
        // Arrange
        TestId id = new(Guid.NewGuid());
        TestEntity first = new(id);
        OtherEntity second = new(id);

        // Act
        bool equals = first.Equals(second);

        // Assert
        Assert.False(equals);
        Assert.False(first == second);
    }

    [Fact]
    public void Equals_WithNullObject_ShouldReturnFalse()
    {
        // Arrange
        TestEntity entity = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = entity.Equals(null);

        // Assert
        Assert.False(equals);
    }

    [Fact]
    public void Equals_WithSameReference_ShouldReturnTrue()
    {
        // Arrange
        TestEntity entity = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = entity.Equals((object)entity);

        // Assert
        Assert.True(equals);
    }

    [Fact]
    public void Equals_WithSameReferenceEntityOverload_ShouldReturnTrue()
    {
        // Arrange
        TestEntity entity = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = entity.Equals((Entity<TestId>)entity);

        // Assert
        Assert.True(equals);
    }

    [Fact]
    public void Equals_ObjectWithSameType_ShouldBeEqual()
    {
        // Arrange
        TestId id = new(Guid.NewGuid());
        TestEntity first = new(id);
        TestEntity second = new(id);

        // Act
        bool equals = first.Equals((object)second);

        // Assert
        Assert.True(equals);
    }

    [Fact]
    public void Equals_ObjectWithDifferentType_ShouldReturnFalse()
    {
        // Arrange
        TestId id = new(Guid.NewGuid());
        TestEntity first = new(id);
        OtherEntity second = new(id);

        // Act
        bool equals = first.Equals((object)second);

        // Assert
        Assert.False(equals);
    }

    [Fact]
    public void Equals_ObjectWithNonEntityType_ShouldReturnFalse()
    {
        // Arrange
        TestEntity first = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = first.Equals((object)"not-an-entity");

        // Assert
        Assert.False(equals);
    }

    [Fact]
    public void Equals_WithOtherNullEntity_ShouldReturnFalse()
    {
        // Arrange
        TestEntity entity = new(new TestId(Guid.NewGuid()));

        // Act
        bool equals = entity.Equals((Entity<TestId>?)null);

        // Assert
        Assert.False(equals);
    }

    [Fact]
    public void OperatorEquals_WithBothNull_ShouldBeTrue()
    {
        // Arrange
        TestEntity? left = null;
        TestEntity? right = null;

        // Act
        bool result = left == right;

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void OperatorEquals_WithLeftNull_ShouldBeFalse()
    {
        // Arrange
        TestEntity? left = null;
        TestEntity right = new(new TestId(Guid.NewGuid()));

        // Act
        bool result = left == right;

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void OperatorEquals_WithRightNull_ShouldBeFalse()
    {
        // Arrange
        TestEntity left = new(new TestId(Guid.NewGuid()));
        TestEntity? right = null;

        // Act
        bool result = left == right;

        // Assert
        Assert.False(result);
    }

    public readonly record struct TestId(Guid Value) : IEntityId;

    public sealed class TestEntity(TestId id) : Entity<TestId>(id)
    {
        public override void ValidateState()
        {
        }
    }

    public sealed class OtherEntity(TestId id) : Entity<TestId>(id)
    {
        public override void ValidateState()
        {
        }
    }

    public sealed class DefaultEntity : Entity<TestId>
    {
        public override void ValidateState()
        {
        }
    }
}
