using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Vendors;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Interceptors;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Queries;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Repositories;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Seeders;
using Microsoft.EntityFrameworkCore;

namespace Howestprime.Movies.Main.Modules.Persistence.EntityFramework;

public static class EFCoreServices
{
    public static IServiceCollection AddEFCoreServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services
            .AddInterceptors()
            .AddSeeders()
            .AddDbContext(configuration)
            .AddRepositories()
            .AddQueries()
            .AddUnitOfWork();
    }

    private static IServiceCollection AddUnitOfWork(
        this IServiceCollection services
    )
    {
        return services
            .AddScoped<IUnitOfWork, EntityFrameworkUoW>(sp =>
            {
                ILogger<EntityFrameworkUoW> logger =
                    sp.GetRequiredService<ILogger<EntityFrameworkUoW>>();

                DomainDbContext context =
                    sp.GetRequiredService<DomainDbContext>();

                EntityFrameworkUoW uow = new(context, logger);

                uow.RegisterRepository<IMovieRepository>(
                    sp.GetRequiredService<IMovieRepository>()
                );

                uow.RegisterRepository<IRoomRepository>(
                    sp.GetRequiredService<IRoomRepository>()
                );

                uow.RegisterRepository<IMovieEventRepository>(
                    sp.GetRequiredService<IMovieEventRepository>()
                );

                return uow;
            });
    }

    private static IServiceCollection AddSeeders(
        this IServiceCollection services
    )
    {
        return services.AddScoped<DomainDbSeeder>();
    }

    private static IServiceCollection AddRepositories(
        this IServiceCollection services
    )
    {
        return services
            .AddScoped<IMovieRepository, MovieRepository>()
            .AddScoped<IRoomRepository, RoomRepository>()
            .AddScoped<IMovieEventRepository, MovieEventRepository>();
    }

    private static IServiceCollection AddQueries(
        this IServiceCollection services
    )
    {
        return services
            .AddScoped<ISearchMovieCatalogQuery, SearchMovieCatalogQuery>()
            .AddScoped<IMovieEventQuery, MovieEventQuery>();
    }

    public static WebApplication ApplyMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var domainContext = scope.ServiceProvider.GetRequiredService<DomainDbContext>();
        domainContext.Database.Migrate();

        return app;
    }

    public static async Task<WebApplication> SeedData(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        DomainDbSeeder seeder = scope.ServiceProvider.GetRequiredService<DomainDbSeeder>();

        await seeder.Seed();

        return app;
    }
    private static IServiceCollection AddInterceptors(
        this IServiceCollection services
    )
    {
        return services
            .AddScoped<PublishDomainEventsInterceptor>();
    }

    private static IServiceCollection AddDbContext(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        string databaseProvider = configuration.GetValue<string>("Database:Provider")!;
        switch (databaseProvider)
        {
            case "PostgreSQL":
                services.AddDbContext<DomainDbContext, PostgresDomainDbContext>();
                services.AddDbContext<QueryDbContext, PostgresQueryDbContext>();
                break;
            default:
                throw new NotSupportedException($"Database provider '{databaseProvider}' is not supported.");
        }

        return services;
    }
}