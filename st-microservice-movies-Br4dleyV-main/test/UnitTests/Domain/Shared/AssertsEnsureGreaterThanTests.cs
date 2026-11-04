using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Shared;

public sealed class AssertsEnsureGreaterThanTests
{
    [Fact]
    public void EnsureGreaterThan_WithValueAboveThreshold_DoesNotThrow()
    {
        Action act = () => Asserts.EnsureGreaterThan(5, 0);
        Assert.Null(Record.Exception(act));
    }

    [Fact]
    public void EnsureGreaterThan_WithValueEqualToThreshold_ThrowsArgumentException()
    {
        Action act = () => Asserts.EnsureGreaterThan(0, 0);
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void EnsureGreaterThan_WithValueBelowThreshold_ThrowsArgumentException()
    {
        Action act = () => Asserts.EnsureGreaterThan(-1, 0);
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void EnsureGreaterThan_WithLargeThreshold_ThrowsArgumentException()
    {
        Action act = () => Asserts.EnsureGreaterThan(10, 100);
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void EnsureGreaterThan_WithValueJustAboveThreshold_DoesNotThrow()
    {
        Action act = () => Asserts.EnsureGreaterThan(1, 0);
        Assert.Null(Record.Exception(act));
    }
}
