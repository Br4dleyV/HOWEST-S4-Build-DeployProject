using Howestprime.Movies.Infrastructure.WebApi.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Howestprime.Movies.Infrastructure.WebApi;

public static class Routes
{
    public static IEndpointRouteBuilder MapRoutes(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder webApi = app.MapGroup("/api");

        webApi.MapMovieRoutes();
        webApi.MapMovieEventRoutes();
        webApi.MapScheduleRoutes();

        return app;
    }

    private static RouteGroupBuilder MapMovieRoutes(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder movies = app.MapGroup("/movie-catalog")
            .WithTags("Movies")
            .WithDescription("All endpoints related to managing the movie catalog.");

        movies.MapPost("/", RegisterMovieController.Invoke)
            .WithName("RegisterMovie")
            .WithDescription("Register a new movie in the catalog.");

        movies.MapGet("/", SearchMovieCatalogController.Invoke)
            .WithName("SearchMovieCatalog")
            .WithDescription("Search the movie catalog by title and/or genres.");

        movies.MapGet("/{movieId:guid}", FindMovieByIdController.Invoke)
            .WithName("FindMovieById")
            .WithDescription("Find a movie by its id.");

        movies.MapPut("/{movieId:guid}", ChangeMovieDetailsController.Invoke)
            .WithName("ChangeMovieDetails")
            .WithDescription("Change the details of an existing movie in the catalog.");

        return movies;
    }

    private static IEndpointRouteBuilder MapMovieEventRoutes(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder events = app.MapGroup("/movie-events")
            .WithTags("Movie Events")
            .WithDescription("All endpoints related to scheduling movie events.");

        events.MapPost("/", ScheduleMovieEventController.Invoke)
            .WithName("ScheduleMovieEvent")
            .WithDescription("Schedule a movie event by assigning a movie to a room and showtime.");

        events.MapPost("/{movieEventId:guid}/bookings", BookMovieEventController.Invoke)
            .WithName("BookMovieEvent")
            .WithDescription("Book tickets for a specific movie event.");

        events.MapGet("/", SearchMovieEventsByMonthController.Invoke)
            .WithName("SearchMovieEventsByMonth")
            .WithDescription("Retrieve all movie events for a specific month.");

        return events;
    }

    private static IEndpointRouteBuilder MapScheduleRoutes(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder schedule = app.MapGroup("/howestprime-schedule")
            .WithTags("Schedule")
            .WithDescription("Endpoints for retrieving the Howestprime movie schedule.");

        schedule.MapGet("/", GetHowestprimeScheduleController.Invoke)
            .WithName("GetHowestprimeSchedule")
            .WithDescription("Retrieve the movie schedule for the next 14 days.");

        return schedule;
    }
}
