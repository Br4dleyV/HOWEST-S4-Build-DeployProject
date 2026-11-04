using System.Globalization;
using Howestprime.Movies.MockServer.Contracts;
using Howestprime.Movies.MockServer.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<MockMoviesStore>();

var app = builder.Build();

var api = app.MapGroup("/api");

api.MapPost("/movie-catalog", (RegisterMovieBody body, MockMoviesStore store) =>
{
    var validationErrors = ValidateRegisterMovie(body);
    if (validationErrors.Count > 0)
    {
        return ValidationProblem(validationErrors);
    }

    var movie = store.RegisterMovie(body);
    return TypedResults.Created($"/api/movie-catalog/{movie.Id:D}", new { id = movie.Id });
});

api.MapGet("/movie-catalog", (HttpRequest request, MockMoviesStore store, string? title, string? genres) =>
{
    if (!HasUserRoleHeader(request))
    {
        return ValidationProblem(new Dictionary<string, string[]>
        {
            ["x-user-role"] = ["The x-user-role header is required."]
        });
    }

    var movies = store.SearchMovies(title, genres)
        .Select(CreateMovieResponse)
        .ToList();

    return TypedResults.Ok(new { data = movies });
});

api.MapPost("/movie-events", (ScheduleMovieEventBody body, MockMoviesStore store) =>
{
    var validationErrors = ValidateScheduleMovieEvent(body);
    if (validationErrors.Count > 0)
    {
        return ValidationProblem(validationErrors);
    }

    if (!store.TryScheduleMovieEvent(body, out var movieEvent, out var scheduleError) || movieEvent is null)
    {
        return scheduleError switch
        {
            ScheduleEventError.MovieNotFound => TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Movie not found",
                detail: $"No movie with id '{body.MovieId:D}' was found."),
            ScheduleEventError.RoomNotFound => TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Room not found",
                detail: $"No room with id '{body.RoomId:D}' was found."),
            ScheduleEventError.Conflict => TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Scheduling conflict",
                detail: "A movie event is already scheduled in this room at the requested time."),
            _ => TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Unexpected error",
                detail: "An unexpected scheduling error occurred.")
        };
    }

    return TypedResults.Created($"/api/movie-events/{movieEvent.Id:D}", new { id = movieEvent.Id });
});

api.MapGet("/movie-events", (MockMoviesStore store, int month, int year) =>
{
    var validationErrors = ValidateMonthAndYear(month, year);
    if (validationErrors.Count > 0)
    {
        return ValidationProblem(validationErrors);
    }

    var payload = new List<object>();
    foreach (var movieEvent in store.FindMovieEventsForMonth(month, year))
    {
        if (TryCreateMovieEventResponse(store, movieEvent, out var response) && response is not null)
        {
            payload.Add(response);
        }
    }

    return TypedResults.Ok(payload);
});

app.Run();

static bool HasUserRoleHeader(HttpRequest request)
{
    return request.Headers.TryGetValue("x-user-role", out var value)
           && !string.IsNullOrWhiteSpace(value.ToString());
}

static IResult ValidationProblem(IDictionary<string, string[]> errors)
{
    return TypedResults.ValidationProblem(
        errors,
        detail: "One or more validation errors occurred.",
        title: "Validation failed");
}

static Dictionary<string, string[]> ValidateRegisterMovie(RegisterMovieBody body)
{
    var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

    if (string.IsNullOrWhiteSpace(body.Title))
    {
        errors["title"] = ["The Title field is required."];
    }

    if (string.IsNullOrWhiteSpace(body.Description))
    {
        errors["description"] = ["The Description field is required."];
    }

    if (body.ReleaseYear < 1888 || body.ReleaseYear > 2100)
    {
        errors["releaseYear"] = ["ReleaseYear must be between 1888 and 2100."];
    }

    if (body.Duration <= 0)
    {
        errors["duration"] = ["Duration must be greater than zero."];
    }

    if (body.Genres.Count == 0 || body.Genres.Any(string.IsNullOrWhiteSpace))
    {
        errors["genres"] = ["At least one non-empty genre is required."];
    }

    if (body.Actors.Count == 0 || body.Actors.Any(string.IsNullOrWhiteSpace))
    {
        errors["actors"] = ["At least one non-empty actor is required."];
    }

    if (body.AgeRating < 0 || body.AgeRating > 18)
    {
        errors["ageRating"] = ["AgeRating must be between 0 and 18."];
    }

    if (!Uri.TryCreate(body.PosterUrl, UriKind.Absolute, out _))
    {
        errors["posterUrl"] = ["PosterUrl must be an absolute URL."];
    }

    return errors;
}

static Dictionary<string, string[]> ValidateScheduleMovieEvent(ScheduleMovieEventBody body)
{
    var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

    if (body.MovieId == Guid.Empty)
    {
        errors["movieId"] = ["MovieId is required."];
    }

    if (body.RoomId == Guid.Empty)
    {
        errors["roomId"] = ["RoomId is required."];
    }

    if (body.Showtime == default)
    {
        errors["showtime"] = ["Showtime is required."];
    }

    return errors;
}

static Dictionary<string, string[]> ValidateMonthAndYear(int month, int year)
{
    var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

    if (month < 1 || month > 12)
    {
        errors["month"] = ["Month must be between 1 and 12."];
    }

    if (year < 1900 || year > 2100)
    {
        errors["year"] = ["Year must be between 1900 and 2100."];
    }

    return errors;
}

static object CreateMovieResponse(MovieEntity movie)
{
    return new
    {
        id = movie.Id,
        title = movie.Title,
        description = movie.Description,
        releaseYear = movie.ReleaseYear,
        duration = movie.Duration,
        genres = movie.Genres,
        actors = movie.Actors,
        ageRating = FormatAgeRating(movie.AgeRating),
        posterUrl = movie.PosterUrl
    };
}

static string FormatAgeRating(int ageRating)
{
    return ageRating switch
    {
        0 => "0+",
        6 => "6+",
        10 => "10+",
        12 => "12+",
        14 => "14+",
        16 => "16+",
        18 => "18+",
        _ => ageRating.ToString(CultureInfo.InvariantCulture)
    };
}

static bool TryCreateMovieEventResponse(MockMoviesStore store, MovieEventEntity movieEvent, out object? response)
{
    response = null;

    if (!store.TryResolveMovieEvent(movieEvent, out var movie, out var room) || movie is null || room is null)
    {
        return false;
    }

    response = new
    {
        id = movieEvent.Id,
        movie = CreateMovieResponse(movie),
        room = new
        {
            id = room.Id,
            name = room.Name,
            capacity = room.Capacity
        },
        showtime = movieEvent.Showtime,
        capacity = movieEvent.RemainingCapacity
    };

    return true;
}

public partial class Program;
