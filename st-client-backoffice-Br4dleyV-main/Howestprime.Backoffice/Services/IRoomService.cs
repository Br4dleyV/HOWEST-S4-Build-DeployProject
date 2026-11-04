using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Backoffice.Services;

public interface IRoomService
{
    Task<IList<Room>> GetRooms();
}
