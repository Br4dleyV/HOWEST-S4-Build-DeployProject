using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Backoffice.Services;

public interface IMovieEventService
{
    Task<string> ScheduleMovieEvent(ScheduleMovieEventRequest eventRequest);
    Task<IList<MovieEvent>> FindMovieEventsForMonth(int month, int year);
}
