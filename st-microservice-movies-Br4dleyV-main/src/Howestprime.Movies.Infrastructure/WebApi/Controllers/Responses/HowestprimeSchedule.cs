namespace Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;

public sealed record Room(
    Guid Id,
    string Name,
    int Capacity
);

public sealed record MovieEvent(
    Guid Id,
    Movie Movie,
    Room Room,
    DateTime Showtime,
    int Capacity
);

public sealed record HowestprimeSchedule(
    DateTime From,
    DateTime To,
    IEnumerable<MovieEvent> MovieEvents
);
