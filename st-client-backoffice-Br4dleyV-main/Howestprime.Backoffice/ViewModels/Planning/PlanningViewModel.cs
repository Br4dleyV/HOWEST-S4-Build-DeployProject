namespace Howestprime.Backoffice.ViewModels.Planning;

/// <summary>
/// PlanningViewModel - Data model for the Planning page
/// 
/// This ViewModel represents the state of the Planning page including:
/// - The currently displayed month
/// - Any error messages that need to be shown
/// - Whether the page is currently loading data
/// 
/// The view (Planning.razor) binds to these properties to display and update the UI.
/// </summary>
public class PlanningViewModel
{
    /// <summary>
    /// The month currently being displayed in the calendar
    /// Defaults to the current date
    /// </summary>
    public DateTime CurrentMonth { get; set; } = DateTime.Now;

    /// <summary>
    /// Error message to display to the user
    /// Empty string means no error
    /// </summary>
    public string ErrorMessage { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the page is currently loading data from the API
    /// Can be used to show loading spinners or disable buttons
    /// </summary>
    public bool IsLoading { get; set; }
}