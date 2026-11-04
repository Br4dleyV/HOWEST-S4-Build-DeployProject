using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Repositories;

public sealed class MovieRepository(
    DomainDbContext context
) : EfCoreGenericRepository<Movie, MovieId>(context), IMovieRepository
{
    /// <summary>
    /// Adds a new movie
    /// </summary>
    /// <param name="movie">The movie to add</param>
    /// <param name="cancellationToken">(Optional) A cancellation token</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public async Task AddAsync(Movie movie, CancellationToken cancellationToken = default)
    {
        await _context.Movies.AddAsync(movie, cancellationToken);
    }

    /// <summary>
    /// Change the details of an existing movie by copying values from the provided movieDetails aggregate.
    /// </summary>
    public async Task ChangeDetailsAsync(MovieId movieId, Movie movieDetails)
    {
        var existing = await _context.Movies.FindAsync(movieId);
        if (existing is null)
            throw new KeyNotFoundException($"Movie with id '{movieId.Value}' was not found.");

        existing.ChangeDetails(
            movieDetails.Title,
            movieDetails.Description,
            movieDetails.Duration,
            movieDetails.ReleaseYear,
            movieDetails.AgeRating,
            movieDetails.PosterUrl,
            movieDetails.Genres,
            movieDetails.Actors
        );
    }
}