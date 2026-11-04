namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Queries;

using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public sealed class SearchMovieCatalogQuery(
    QueryDbContext context
) : ISearchMovieCatalogQuery
{
    public async Task<IReadOnlyList<MovieData>> Fetch(Expression<Func<MovieData, bool>> movieFilter)
    {
        return await context.Movies
            .Where(movieFilter)
            .ToListAsync() ?? [];
    }
}
