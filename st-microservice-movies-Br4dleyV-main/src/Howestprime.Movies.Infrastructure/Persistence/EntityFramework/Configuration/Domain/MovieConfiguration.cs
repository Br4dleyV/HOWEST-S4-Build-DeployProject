namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Domain;

using Howestprime.Movies.Domain.Movies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class MovieConfiguration : IEntityTypeConfiguration<Movie>
{
    /// <summary>
    /// Configures the entity mapping for the Movie aggregate root, including its properties and owned collections (Genres and Actors).
    /// </summary>
    /// <param name="builder">The builder used to configure the entity.</param>
    public void Configure(EntityTypeBuilder<Movie> builder)
    {
        builder.ToTable("Movies");

        builder.HasKey(movie => movie.Id);
        builder.Property(movie => movie.Id).ValueGeneratedNever();

        builder.Property(movie => movie.Title).IsRequired();
        builder.Property(movie => movie.Description).IsRequired();
        builder.Property(movie => movie.Duration).IsRequired();
        builder.Property(movie => movie.ReleaseYear).IsRequired();
        builder.Property(movie => movie.AgeRating).IsRequired();
        builder.Property(movie => movie.PosterUrl).IsRequired();

        builder.OwnsMany(movie => movie.Genres, ownedBuilder =>
        {
            ownedBuilder.ToJson();
            ownedBuilder.Property(genre => genre.Value).IsRequired();
        });

        builder.OwnsMany(movie => movie.Actors, ownedBuilder =>
        {
            ownedBuilder.ToJson();
            ownedBuilder.Property(actor => actor.Value).IsRequired();
        });
    }
}
