using System.ComponentModel.DataAnnotations;

namespace Howestprime.Backoffice.ViewModels.RegisterMovie;

public sealed class RegisterMovieViewModel : IValidatableObject
{
    [Required(ErrorMessage = "Title is required.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    public string Description { get; set; } = string.Empty;

    [Range(1888, 2100, ErrorMessage = "Release year must be between 1888 and 2100.")]
    public int ReleaseYear { get; set; } = DateTime.UtcNow.Year;

    [Range(1, 600, ErrorMessage = "Duration must be between 1 and 600 minutes.")]
    public int Duration { get; set; }

    [Required(ErrorMessage = "Genres are required.")]
    public string Genres { get; set; } = string.Empty;

    [Required(ErrorMessage = "Age rating is required.")]
    [Range(0, 18, ErrorMessage = "Age rating must be between 0 and 18.")]
    public int AgeRating { get; set; }

    [Required(ErrorMessage = "Actors are required.")]
    public string Actors { get; set; } = string.Empty;

    [Required(ErrorMessage = "Poster URL is required.")]
    [Url(ErrorMessage = "Poster URL must be a valid absolute URL.")]
    public string PosterUrl { get; set; } = string.Empty;

    public IReadOnlyList<string> GetGenres() =>
        Genres
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    public IReadOnlyList<string> GetActors() =>
        Actors
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (GetGenres().Count == 0)
        {
            yield return new ValidationResult("Provide at least one genre.", [nameof(Genres)]);
        }

        if (GetActors().Count == 0)
        {
            yield return new ValidationResult("Provide at least one actor.", [nameof(Actors)]);
        }

        if (!string.IsNullOrWhiteSpace(PosterUrl) &&
            !Uri.TryCreate(PosterUrl, UriKind.Absolute, out _))
        {
            yield return new ValidationResult("Poster URL must be a valid absolute URL.", [nameof(PosterUrl)]);
        }
    }
}
