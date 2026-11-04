namespace Howestprime.Movies.Shared.Exceptions;

public sealed class NotFoundException(string message) : Exception(message)
{
}