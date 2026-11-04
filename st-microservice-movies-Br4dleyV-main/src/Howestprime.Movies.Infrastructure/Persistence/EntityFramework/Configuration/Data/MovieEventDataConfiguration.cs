using Howestprime.Movies.Application.Contracts.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Data;

public sealed class MovieEventDataConfiguration : IEntityTypeConfiguration<MovieEventData>
{
    public void Configure(EntityTypeBuilder<MovieEventData> builder)
    {
        builder.ToTable("MovieEvents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.MovieId).IsRequired();
        builder.Property(e => e.RoomId).IsRequired();
        builder.Property(e => e.Showtime).IsRequired();
    }
}
