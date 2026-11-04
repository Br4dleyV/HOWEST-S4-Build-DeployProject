using Howestprime.Movies.Application.Contracts.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Data;

public sealed class MovieDataConfiguration : IEntityTypeConfiguration<MovieData>
{
    public void Configure(EntityTypeBuilder<MovieData> builder)
    {
        builder.ToTable("Movies");
        builder.HasKey(movie => movie.Id);

        builder.Property(movie => movie.Title).IsRequired();
        builder.Property(movie => movie.Description).IsRequired();
        builder.Property(movie => movie.Duration);
        builder.Property(movie => movie.ReleaseYear);
        builder.Property(movie => movie.AgeRating);
        builder.Property(movie => movie.PosterUrl).IsRequired();

        builder.OwnsMany(movie => movie.Genres, genreBuilder =>
        {
            genreBuilder.ToJson();
            genreBuilder.Property(g => g.Value);
        });

        builder.OwnsMany(movie => movie.Actors, actorBuilder =>
        {
            actorBuilder.ToJson();
            actorBuilder.Property(a => a.Value);
        });
    }
}