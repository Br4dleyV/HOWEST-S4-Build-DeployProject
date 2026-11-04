using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Queries;

public sealed class MovieEventQuery(QueryDbContext context) : IMovieEventQuery
{
    public async Task<IReadOnlyList<MovieEventData>> Fetch(
        Expression<Func<MovieEventData, bool>> filter)
    {
        return await context.MovieEvents
            .Where(filter)
            .ToListAsync();
    }
}
