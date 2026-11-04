using Aornis;

namespace Howestprime.Movies.Domain.Shared;

public interface IRepository {}

public interface IRepository<TAggregateRoot, TId> : IRepository
    where TAggregateRoot : AggregateRoot<TId>
    where TId : struct, IEntityId
{
    Task<bool> Exists(TId id);
    Task<Optional<TAggregateRoot>> ById(TId id);
    Task Save(TAggregateRoot aggregateRoot);
    Task Remove(TAggregateRoot aggregateRoot);
}