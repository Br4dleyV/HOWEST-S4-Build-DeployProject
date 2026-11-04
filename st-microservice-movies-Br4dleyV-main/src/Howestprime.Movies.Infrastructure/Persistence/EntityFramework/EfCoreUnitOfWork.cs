using Microsoft.Extensions.Logging;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.Shared;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework;

public sealed class EntityFrameworkUoW (
    DomainDbContext dbContext,
    ILogger<EntityFrameworkUoW> logger
) : IUnitOfWork
{
    private readonly Dictionary<string, object> _repositoriesWithRepoKey = [];

    public Task Do()
    {
        // Pre or post-transaction hooks are handled via EF Core interceptors.
        return dbContext.SaveChangesAsync();
    }

    public TRepository Repo<TRepository>()
        where TRepository : IRepository
    {
        logger.LogRetrievingRepository(typeof(TRepository).FullName);

        string repoKey = typeof(TRepository).FullName
            ?? throw new InvalidOperationException("Cannot get full name of type.");

        if (_repositoriesWithRepoKey.TryGetValue(repoKey, out object? value))
            return (TRepository)value;

        throw new InvalidOperationException($"Repository for type {repoKey} not found.");
    }

    public Task Save<TRepository>(IAggregateRoot aggregateRoot) 
        where TRepository : IRepository
    {
        string aggregateTypeName = aggregateRoot.GetType().FullName ?? "UnknownAggregateRoot";
        logger.LogSavingAggregate(
            aggregateTypeName,
            typeof(TRepository).FullName);
        
        string repoKey = typeof(TRepository).FullName
            ?? throw new InvalidOperationException("Cannot get full name of type.");

        if (!_repositoriesWithRepoKey.TryGetValue(repoKey, out object? repositoryObj))
            throw new InvalidOperationException($"Repository for type {repoKey} not found.");

        return ((dynamic)repositoryObj).Save((dynamic)aggregateRoot);
    }

    public void RegisterRepository<TRepository>(TRepository repository)
        where TRepository : IRepository
    {
        string repoKey = typeof(TRepository).FullName
            ?? throw new InvalidOperationException("Cannot get full name of type.");

        _repositoriesWithRepoKey[repoKey] = repository;

        logger.LogRegisteringRepository(typeof(TRepository).FullName);
    }
}