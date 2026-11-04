using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Backoffice.Services;

public interface IMovieService
{
    Task<List<Movie>> GetMovies(string? title = null, string? genre = null, string? userRole = null);
    Task<string> RegisterMovie(RegisterMovieRequest movieRequest);
}
