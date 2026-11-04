namespace Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;

public sealed record Movie(
    Guid Id,
    string Title,
    string Description,
    int Duration,
    int ReleaseYear,
    string AgeRating,
    string PosterUrl,
    IEnumerable<string> Genres,
    IEnumerable<string> Actors,
    IEnumerable<DateTime> Showtimes
);