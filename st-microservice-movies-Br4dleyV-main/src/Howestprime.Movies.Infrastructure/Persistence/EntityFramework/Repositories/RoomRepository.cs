using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Repositories;

public sealed class RoomRepository(DomainDbContext context)
    : EfCoreGenericRepository<Room, RoomId>(context), IRoomRepository
{
}
