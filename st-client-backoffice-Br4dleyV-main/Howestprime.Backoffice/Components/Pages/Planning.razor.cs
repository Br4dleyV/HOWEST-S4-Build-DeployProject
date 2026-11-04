using Howestprime.Movies.ApiClient.Clients;
using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;
using Microsoft.AspNetCore.Components;
using Howestprime.Backoffice.ViewModels.Planning;

namespace Howestprime.Backoffice.Components.Pages
{
    /// <summary>
    /// Planning Component - Allows staff to schedule movie events for specific dates, times, and rooms. Using SSR.
    /// </summary>
    public partial class Planning : ComponentBase
    {        
        /// API client for managing movie events (schedule, fetch, etc.)
        [Inject]
        public required IMovieEventsApiClient MovieEventsApiClient { get; set; }

        /// API client for searching and retrieving movies from the catalog
        [Inject]
        public required IMovieCatalogApiClient MovieCatalogApiClient { get; set; }
        
        /// View model for planning page state management
        private PlanningViewModel viewModel = new();

        /// Currently displayed month (used for calendar rendering)
        private DateTime currentMonth = DateTime.Now;

        /// List of movie events scheduled for the current month
        private List<MovieEvent> movieEvents = [];

        /// List of all available movies that can be scheduled
        /// Populated from the movie catalog API
        private List<Movie> AvailableMovies = [];

        /// Error message displayed at the top of the page (page-level errors)
        private string errorMessage = string.Empty;

        /// Error message displayed in the modal form (validation errors, API errors)
        private string modalError = string.Empty;

        /// Controls visibility of the modal dialog for adding events
        private bool showModal = false;

        /// The day that was clicked (when opening the modal)
        private int selectedDay = 0;

        /// Room ID selected in the modal form
        private string selectedRoom = string.Empty;

        /// Time slot selected in the modal form (15:00 or 19:00)
        private string selectedTime = string.Empty;

        /// Movie ID selected in the modal form
        private string selectedMovie = string.Empty;
        
        /// Available time slots for movie events (two showings per day per room)
        private static readonly List<string> TimeSlots = new() { "15:00", "19:00" };

        /// Hard-coded rooms available for scheduling
        /// Blue Room: 019d059e-d220-71db-8a1a-ec7569492999 (seeded by database)
        /// Yellow Room: 019d059e-d220-75fe-b936-0a97cd75216e (seeded by database)
        private static readonly List<Room> Rooms =
        [
            new() { Id = Guid.Parse("019d059e-d220-71db-8a1a-ec7569492999"), Name = "Blue Room", Capacity = 100 },
            new() { Id = Guid.Parse("019d059e-d220-75fe-b936-0a97cd75216e"), Name = "Yellow Room", Capacity = 80 }
        ];
        
        /// Runs when the component is initialized
        /// Loads movies and the current months events from the API
        protected override async Task OnInitializedAsync()
        {
            await LoadMoviesAsync();
            await LoadMovieEventsForMonthAsync();
        }
        
        /// Fetches all movies from the movie catalog API
        /// These movies will appear in the modal dropdown
        private async Task LoadMoviesAsync()
        {
            try
            {
                // Create search request
                var request = new SearchMovieCatalogRequest
                {
                    Title = string.Empty,
                    Genres = null,
                    UserRole = "Manager"
                };

                // Call API
                var result = await MovieCatalogApiClient.SearchMovieCatalogAsync(request);

                if (result.IsFailure)
                {
                    errorMessage = result.Error?.Detail ?? result.Error?.Title ?? "Failed to load movies.";
                }
                else
                {
                    AvailableMovies = result.Value?.Data.ToList() ?? [];
                }
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
            }
            
            // Notify Blazor to re-render the component with new data
            StateHasChanged();
        }

        /// Fetches all movie events scheduled for the current month
        /// Populates the calendar with scheduled events
        private async Task LoadMovieEventsForMonthAsync()
        {
            errorMessage = string.Empty;
            try
            {
                // Create request with current month/year
                var request = new FindMovieEventsForMonthRequest
                {
                    Month = currentMonth.Month,
                    Year = currentMonth.Year
                };

                // Call API
                var result = await MovieEventsApiClient.FindMovieEventsForMonthAsync(request);

                if (result.IsFailure)
                {
                    errorMessage = result.Error?.Detail ?? result.Error?.Title ?? "Failed to load movie events.";
                }
                else
                {
                    // Store the events for rendering in calendar
                    movieEvents = result.Value?.ToList() ?? [];
                }
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
            }
            
            // Notify Blazor to re-render the component with new data
            StateHasChanged();
        }

        /// Changes the displayed month by the given offset
        /// Offset: -1 for previous month, +1 for next month
        /// Automatically loads events for the new month
        private async Task ChangeMonthAsync(int offset)
        {
            // Update the current month
            currentMonth = currentMonth.AddMonths(offset);
            
            // Load events for the new month
            await LoadMovieEventsForMonthAsync();
            
            // Notify Blazor to re-render (update month display and calendar)
            StateHasChanged();
        }

        /// Gets all days in the current month (1-31 depending on month)
        /// Returns a list: [1, 2, 3, ..., 28/29/30/31]
        private List<int> GetDaysInMonth()
        {
            // Calculate how many days are in the current month
            var daysInMonth = DateTime.DaysInMonth(currentMonth.Year, currentMonth.Month);
            var days = new List<int>();

            // Create list of day numbers
            for (int day = 1; day <= daysInMonth; day++)
            {
                days.Add(day);
            }

            return days;
        }

        /// Finds a movie event for a specific day and time slot
        /// Returns null if no event is scheduled for that day/time
        private MovieEvent? GetMovieEventForTimeSlot(int day, string timeSlot)
        {
            // Parse time slot string (e.g., "15:00" -> hour=15, minute=00)
            var hour = int.Parse(timeSlot.Split(':')[0]);
            var minute = int.Parse(timeSlot.Split(':')[1]);

            // Search for an event matching:
            // - Same year
            // - Same month
            // - Same day
            // - Same hour
            // - Same minute
            return movieEvents.FirstOrDefault(e =>
                e.Showtime.Year == currentMonth.Year &&
                e.Showtime.Month == currentMonth.Month &&
                e.Showtime.Day == day &&
                e.Showtime.Hour == hour &&
                e.Showtime.Minute == minute);
        }

        /// Converts a room ID to a CSS class for color coding
        /// Matches mock server seeded room IDs
        private string GetRoomClass(Guid roomId)
        {
            return roomId == Guid.Parse("019c778a-5272-772c-8b1b-88c2f0eebc0b") ? "event-room1" : "event-room2";
        }

        /// Opens the modal dialog for adding a new movie event
        /// Called when user clicks on a day in the calendar
        private void OpenAddEventModal(int day)
        {
            // Store which day was clicked
            selectedDay = day;
            
            // Clear any previous form values
            selectedRoom = string.Empty;
            selectedTime = string.Empty;
            selectedMovie = string.Empty;
            modalError = string.Empty;
            
            // Show the modal
            showModal = true;
            
            // Notify Blazor to re-render (show modal)
            StateHasChanged();
        }

        /// Closes the modal dialog
        /// Called when user clicks outside modal or form submission is complete
        private void CloseModal()
        {
            // Hide the modal
            showModal = false;
            
            // Clear error messages
            modalError = string.Empty;
            
            // Notify Blazor to re-render (hide modal)
            StateHasChanged();
        }

        /// Handles form submission for scheduling a new movie event
        /// Validates the form, sends the event to the API, and updates the calendar
        private async Task SaveNewEventAsync()
        {
            // Clear any previous errors
            modalError = string.Empty;

            // Validate that all form fields are filled
            if (string.IsNullOrEmpty(selectedRoom) || string.IsNullOrEmpty(selectedTime) || string.IsNullOrEmpty(selectedMovie))
            {
                // Show validation error
                modalError = "Please fill in all fields.";
                StateHasChanged();
                return;
            }

            try
            {
                var showtime = new DateTime(currentMonth.Year, currentMonth.Month, selectedDay,
                    int.Parse(selectedTime.Split(':')[0]),
                    int.Parse(selectedTime.Split(':')[1]), 0, DateTimeKind.Utc);

                var now = DateTimeOffset.UtcNow;
                if (showtime <= now)
                {
                    modalError = "Please choose a future date and time.";
                    StateHasChanged();
                    return;
                }

                if (showtime > now.AddDays(14))
                {
                    modalError = "Please choose a date within the next 14 days.";
                    StateHasChanged();
                    return;
                }

                // Build the request to schedule the movie event
                var request = new ScheduleMovieEventRequest
                {
                    MovieId = Guid.Parse(selectedMovie),
                    RoomId = Guid.Parse(selectedRoom),
                    Showtime = showtime
                };

                // Call API to schedule the event (no overwrite parameter - server always overwrites)
                var result = await MovieEventsApiClient.ScheduleMovieEventAsync(request);

                if (result.IsFailure)
                {
                    // Display error message from API
                    modalError = result.Error?.Detail ?? result.Error?.Title ?? "Failed to schedule movie event.";
                    StateHasChanged();
                }
                else
                {
                    // Success! Reload events and close modal
                    await LoadMovieEventsForMonthAsync();
                    CloseModal();
                }
            }
            catch (Exception ex)
            {
                // Unexpected error
                modalError = ex.Message;
                StateHasChanged();
            }
        }
    }
}