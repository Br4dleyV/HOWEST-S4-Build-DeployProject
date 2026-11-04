using Howestprime.Movies.MockServer.Contracts;

namespace Howestprime.Movies.MockServer.Domain;

public sealed class MockMoviesStore
{
    private readonly object _sync = new();

    private readonly List<MovieEntity> _movies = [];
    private readonly List<RoomEntity> _rooms = [];
    private readonly List<MovieEventEntity> _movieEvents = [];

    public MockMoviesStore()
    {
        SeedRooms();
        SeedMovies();
        SeedMovieEvents();
    }

    public IReadOnlyList<MovieEntity> SearchMovies(string? title, string? genres)
    {
        lock (_sync)
        {
            var query = _movies.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(movie =>
                    movie.Title.Contains(title, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(genres))
            {
                var requestedGenres = genres
                    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                if (requestedGenres.Count > 0)
                {
                    query = query.Where(movie => movie.Genres.Any(requestedGenres.Contains));
                }
            }

            return query
                .Select(CloneMovie)
                .ToList();
        }
    }

    public bool TryGetRoom(Guid roomId, out RoomEntity? room)
    {
        lock (_sync)
        {
            room = _rooms.FirstOrDefault(candidate => candidate.Id == roomId);
            room = room is null ? null : CloneRoom(room);
            return room is not null;
        }
    }

    public MovieEntity RegisterMovie(RegisterMovieBody body)
    {
        lock (_sync)
        {
            var movie = new MovieEntity
            {
                Id = Guid.NewGuid(),
                Title = body.Title,
                Description = body.Description,
                ReleaseYear = body.ReleaseYear,
                Duration = body.Duration,
                Genres = body.Genres.ToList(),
                Actors = body.Actors.ToList(),
                AgeRating = body.AgeRating,
                PosterUrl = body.PosterUrl
            };

            _movies.Add(movie);
            return CloneMovie(movie);
        }
    }

    public bool TryScheduleMovieEvent(ScheduleMovieEventBody body, out MovieEventEntity? movieEvent, out ScheduleEventError error)
    {
        lock (_sync)
        {
            if (_movies.All(movie => movie.Id != body.MovieId))
            {
                movieEvent = null;
                error = ScheduleEventError.MovieNotFound;
                return false;
            }

            var room = _rooms.FirstOrDefault(candidate => candidate.Id == body.RoomId);
            if (room is null)
            {
                movieEvent = null;
                error = ScheduleEventError.RoomNotFound;
                return false;
            }


            var existing = _movieEvents.FirstOrDefault(existingEvent =>
                existingEvent.RoomId == body.RoomId && existingEvent.Showtime == body.Showtime);

            if (existing is not null)
            {
                _movieEvents.Remove(existing);
            }

            var createdEvent = new MovieEventEntity
            {
                Id = Guid.NewGuid(),
                MovieId = body.MovieId,
                RoomId = body.RoomId,
                Showtime = body.Showtime,
                TotalCapacity = room.Capacity,
                StandardVisitors = 0,
                DiscountVisitors = 0
            };

            _movieEvents.Add(createdEvent);
            movieEvent = CloneMovieEvent(createdEvent);
            error = ScheduleEventError.None;
            return true;
        }
    }

    public IReadOnlyList<MovieEventEntity> FindMovieEventsForMonth(int month, int year)
    {
        lock (_sync)
        {
            return _movieEvents
                .Where(movieEvent => movieEvent.Showtime.Month == month && movieEvent.Showtime.Year == year)
                .OrderBy(movieEvent => movieEvent.Showtime)
                .Select(CloneMovieEvent)
                .ToList();
        }
    }

    public bool TryResolveMovieEvent(MovieEventEntity movieEvent, out MovieEntity? movie, out RoomEntity? room)
    {
        lock (_sync)
        {
            movie = _movies.FirstOrDefault(candidate => candidate.Id == movieEvent.MovieId);
            room = _rooms.FirstOrDefault(candidate => candidate.Id == movieEvent.RoomId);

            movie = movie is null ? null : CloneMovie(movie);
            room = room is null ? null : CloneRoom(room);

            return movie is not null && room is not null;
        }
    }

    private void SeedRooms()
    {
        _rooms.AddRange(
        [
            new RoomEntity
            {
                Id = Guid.Parse("019d059e-d220-71db-8a1a-ec7569492999"),
                Name = "Blue Room",
                Capacity = 100
            },
            new RoomEntity
            {
                Id = Guid.Parse("019d059e-d220-75fe-b936-0a97cd75216e"),
                Name = "Yellow Room",
                Capacity = 80
            }
        ]);
    }

    private void SeedMovies()
    {
        _movies.AddRange(
        [
            new MovieEntity
            {
                Id = Guid.Parse("3e183e7f-4c76-4fb9-a9ab-4e7dd39a61f1"),
                Title = "The Shawshank Redemption",
                Description = "Two imprisoned men bond over years while finding solace and eventual redemption through acts of decency.",
                ReleaseYear = 1994,
                Duration = 142,
                Genres = ["Drama"],
                Actors = ["Tim Robbins", "Morgan Freeman"],
                AgeRating = 16,
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_QL75_UX1000_CR0,0,1000,563_.jpg"
            },
            new MovieEntity
            {
                Id = Guid.Parse("c5f2c94e-e22c-472e-86c3-d4e0cb3cc76f"),
                Title = "The Godfather",
                Description = "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                ReleaseYear = 1972,
                Duration = 175,
                Genres = ["Crime", "Drama"],
                Actors = ["Marlon Brando", "Al Pacino"],
                AgeRating = 16,
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UX128_CR0,1,128,176_AL_.jpg"
            },
            new MovieEntity
            {
                Id = Guid.Parse("5e08a846-3f3f-47ad-9f9e-1a8f441a2f2d"),
                Title = "The Dark Knight",
                Description = "When the menace known as the Joker wreaks havoc, Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
                ReleaseYear = 2008,
                Duration = 152,
                Genres = ["Action", "Crime", "Drama"],
                Actors = ["Christian Bale", "Heath Ledger"],
                AgeRating = 12,
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX1000_CR0,0,1000,563_.jpg"
            },
            new MovieEntity
            {
                Id = Guid.Parse("b2718f52-5e61-4c42-aa6e-f66d14f0a6ce"),
                Title = "The Godfather Part II",
                Description = "The early life and career of Vito Corleone unfolds while his son Michael expands and tightens the family crime syndicate.",
                ReleaseYear = 1974,
                Duration = 202,
                Genres = ["Crime", "Drama"],
                Actors = ["Al Pacino", "Robert De Niro"],
                AgeRating = 16,
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UX128_CR0,1,128,176_AL_.jpg"
            },
            new MovieEntity
            {
                Id = Guid.Parse("9ba98443-93f2-49e5-95c3-55595f4ece90"),
                Title = "12 Angry Men",
                Description = "A jury holdout attempts to prevent a miscarriage of justice by forcing colleagues to reconsider the evidence.",
                ReleaseYear = 1957,
                Duration = 96,
                Genres = ["Crime", "Drama"],
                Actors = ["Henry Fonda", "Lee J. Cobb"],
                AgeRating = 12,
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_QL75_UX1000_CR0,0,1000,563_.jpg"
            }
        ]);
    }

    private void SeedMovieEvents()
    {
        var anchor = new DateTimeOffset(DateTimeOffset.UtcNow.Date, TimeSpan.Zero);
        var scheduleBlueprint = new (int DaysOffset, int Hour)[]
        {
            (-14, 15),
            (-11, 15),
            (-8, 15),
            (-5, 15),
            (-2, 15),
            (1, 19),
            (4, 19),
            (7, 19),
            (10, 19),
            (13, 19)
        };
        var roomIds = _rooms.Select(room => room.Id).ToArray();
        var movieIds = _movies.Select(movie => movie.Id).ToArray();

        for (var index = 0; index < scheduleBlueprint.Length; index++)
        {
            var blueprint = scheduleBlueprint[index];
            var showtime = anchor.AddDays(blueprint.DaysOffset).AddHours(blueprint.Hour);
            var movieId = movieIds[index % movieIds.Length];
            var roomId = roomIds[index % roomIds.Length];
            var room = _rooms.First(candidate => candidate.Id == roomId);

            _movieEvents.Add(new MovieEventEntity
            {
                Id = Guid.NewGuid(),
                MovieId = movieId,
                RoomId = roomId,
                Showtime = showtime,
                TotalCapacity = room.Capacity,
                StandardVisitors = 0,
                DiscountVisitors = 0
            });
        }
    }

    private static MovieEntity CloneMovie(MovieEntity source) =>
        new()
        {
            Id = source.Id,
            Title = source.Title,
            Description = source.Description,
            ReleaseYear = source.ReleaseYear,
            Duration = source.Duration,
            Genres = source.Genres.ToList(),
            Actors = source.Actors.ToList(),
            AgeRating = source.AgeRating,
            PosterUrl = source.PosterUrl
        };

    private static RoomEntity CloneRoom(RoomEntity source) =>
        new()
        {
            Id = source.Id,
            Name = source.Name,
            Capacity = source.Capacity
        };

    private static MovieEventEntity CloneMovieEvent(MovieEventEntity source) =>
        new()
        {
            Id = source.Id,
            MovieId = source.MovieId,
            RoomId = source.RoomId,
            Showtime = source.Showtime,
            TotalCapacity = source.TotalCapacity,
            StandardVisitors = source.StandardVisitors,
            DiscountVisitors = source.DiscountVisitors
        };
}
