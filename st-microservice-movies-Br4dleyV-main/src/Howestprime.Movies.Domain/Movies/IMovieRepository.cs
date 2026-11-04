using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies;

/// <summary>
/// Interface for the movies repository, responsible for managing movie entities in the data store.
/// </summary>
public interface IMovieRepository : IRepository<Movie, MovieId>
{
    /// <summary>
    /// Asynchronously adds a new movie to the repository. Throws an exception if the movie is null or if the movie fails validation.
    /// </summary>
    /// <param name="movie">The movie to add to the repository. Cannot be null.</param>
    /// <param name="cancellationToken">(Optional) A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous add operation.</returns>
    Task AddAsync(Movie movie, CancellationToken cancellationToken = default);

    /// <summary>
    /// Change a movies details
    /// </summary>
    /// <param name="movieId">The ID of the movie to change the details of</param>
    /// <param name="movieDetails">The new details for the movie (all movie entity properties need to be supplied here)</param>
    /// <returns>A task that represents the asynchronous change operation.</returns>
    Task ChangeDetailsAsync(MovieId movieId, Movie movieDetails);
}