using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Data;
using Microsoft.EntityFrameworkCore;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;

public abstract class QueryDbContext : DbContext
{
    public DbSet<MovieData> Movies { get; set; } = null!;
    public DbSet<MovieEventData> MovieEvents { get; set; } = null!;
    public DbSet<RoomData> Rooms { get; set; } = null!;

    protected QueryDbContext()
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new MovieDataConfiguration());
        modelBuilder.ApplyConfiguration(new MovieEventDataConfiguration());
        modelBuilder.ApplyConfiguration(new RoomDataConfiguration());
    }
}