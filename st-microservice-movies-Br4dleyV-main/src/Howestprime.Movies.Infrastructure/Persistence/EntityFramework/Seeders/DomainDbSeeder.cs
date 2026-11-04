using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Seeders;

public class DomainDbSeeder(DomainDbContext context, ILogger<DomainDbSeeder> _logger)
{
    public async Task Seed()
    {
        await SeedRooms();
        await SeedMovies();
    }

    private async Task SeedRooms()
    {
        if (await context.Rooms.AnyAsync())
            return;

        _logger.LogInformation("Seeding rooms...");

        var rooms = new List<Room>
        {
            Room.Create("Blue Room",   100, EntityId.New<RoomId>(Guid.Parse("019d059e-d220-71db-8a1a-ec7569492999"))),
            Room.Create("Yellow Room",  80, EntityId.New<RoomId>(Guid.Parse("019d059e-d220-75fe-b936-0a97cd75216e")))
        };

        context.Rooms.AddRange(rooms);
        await context.SaveChangesAsync();

        _logger.LogInformation("Rooms seeded.");
    }

    private async Task SeedMovies()
    {
        if (await context.Movies.AnyAsync())
            return;

        _logger.LogInformation("Seeding initial data...");

        // Create some sample movies to seed into the database
        List<Movie> movies =
                    [
                        Movie.Register(
                            new MovieId(Guid.NewGuid()),
                            Title.Create("Spider-Man: No Way Home"),
                            Description.Create("Spider-Man!!!"),
                            Duration.Create(148),
                            ReleaseYear.Create(2021),
                            AgeRating.Create(13),
                            PosterUrl.Create("https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"),
                            [Genre.Create("Sci-Fi"), Genre.Create("Thriller")],
                            [Actor.Create("Leonardo DiCaprio"), Actor.Create("Joseph Gordon-Levitt")]
                        ),
                        Movie.Register(
                            new MovieId(Guid.NewGuid()),
                            Title.Create("Spider-Man: Far From Home"),
                            Description.Create("Another Spider-Man!!!"),
                            Duration.Create(123),
                            ReleaseYear.Create(2019),
                            AgeRating.Create(14),
                            PosterUrl.Create("https://m.media-amazon.com/images/M/MV5BMzNhNTE0NWQtN2E1Ny00NjcwLTg1YTctMGY1NmMwODJmY2NmXkEyXkFqcGc@._V1_.jpg"),
                            [Genre.Create("Sci-Fi"), Genre.Create("Thriller")],
                            [Actor.Create("Leonardo DiCaprio"), Actor.Create("Joseph Gordon-Levitt")]
                        ),
                    ];

        // Add the movies to the context and save changes to the database
        context.Movies.AddRange(movies);
        await context.SaveChangesAsync();

        _logger.LogInformation("Seeding completed.");
    }
}
