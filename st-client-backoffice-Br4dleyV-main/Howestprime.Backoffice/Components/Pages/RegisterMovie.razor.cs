using Howestprime.Backoffice.ViewModels.RegisterMovie;
using Howestprime.Movies.ApiClient.Clients;
using Howestprime.Movies.ApiClient.Requests;
using Microsoft.AspNetCore.Components;

namespace Howestprime.Backoffice.Components.Pages
{
    public partial class RegisterMovie : ComponentBase
    {
        [Inject]
        public required IMovieCatalogApiClient MovieCatalogApiClient { get; set; }

        private RegisterMovieViewModel model = new();

        private string errorMessage = string.Empty;
        private string successMessage = string.Empty;
        private bool isSubmitting = false;

        private async Task RegisterMovieAsync()
        {
            errorMessage = string.Empty;
            successMessage = string.Empty;
            isSubmitting = true;

            try
            {
                var request = new RegisterMovieRequest
                {
                    Title = model.Title.Trim(),
                    Description = model.Description.Trim(),
                    ReleaseYear = model.ReleaseYear,
                    Duration = model.Duration,
                    Genres = model.GetGenres(),
                    Actors = model.GetActors(),
                    AgeRating = model.AgeRating,
                    PosterUrl = model.PosterUrl.Trim()
                };

                var result = await MovieCatalogApiClient.RegisterMovieAsync(request);

                if (result.IsFailure)
                {
                    errorMessage = result.Error?.Detail ?? result.Error?.Title ?? "Failed to register movie.";
                }
                else
                {
                    successMessage = $"Movie {model.Title} registered successfully.";
                    model = new RegisterMovieViewModel
                    {
                        ReleaseYear = DateTime.UtcNow.Year
                    };
                }
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
            }
            finally
            {
                isSubmitting = false;
                StateHasChanged();
            }
        }

        private Task OnPosterUrlChanged(string posterUrl)
        {
            model.PosterUrl = posterUrl;
            StateHasChanged();
            return Task.CompletedTask;
        }
    }
}
