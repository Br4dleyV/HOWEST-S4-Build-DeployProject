using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Shared.Logging;

/// <summary>
/// Centralized logging messages using LoggerMessage Source Generator for high-performance logging.
/// </summary>
public static partial class LogMessages
{
    // AMQP Broker Configuration (1000-1002)
    [LoggerMessage(
        EventId = 1000,
        Level = LogLevel.Information,
        Message = "Connecting to AMQP broker at {Host}.")]
    public static partial void LogConnectingToAmqpBroker(this ILogger logger, string host);

    [LoggerMessage(
        EventId = 1001,
        Level = LogLevel.Information,
        Message = "Registered consumer on exchange '{ExchangeName}' for event '{Event}' with operationId '{OperationId}'.")]
    public static partial void LogRegisteredConsumer(this ILogger logger, string exchangeName, string @event, string operationId);

    [LoggerMessage(
        EventId = 1002,
        Level = LogLevel.Information,
        Message = "Registered publisher on exchange '{ExchangeName}' for events '{Events}'.")]
    public static partial void LogRegisteredPublisher(this ILogger logger, string exchangeName, string events);

    // Memory Lane Unit of Work (1003-1006)
    [LoggerMessage(
        EventId = 1003,
        Level = LogLevel.Information,
        Message = "Executing post-transaction hook: {HookType}")]
    public static partial void LogExecutingPostTransactionHook(this ILogger logger, string? hookType);

    [LoggerMessage(
        EventId = 1004,
        Level = LogLevel.Information,
        Message = "Retrieving repository of type: {RepositoryType}")]
    public static partial void LogRetrievingRepository(this ILogger logger, string? repositoryType);

    [LoggerMessage(
        EventId = 1005,
        Level = LogLevel.Information,
        Message = "Saving aggregate of type: {AggregateType} using repository of type: {RepositoryType}")]
    public static partial void LogSavingAggregate(this ILogger logger, string? aggregateType, string? repositoryType);

    [LoggerMessage(
        EventId = 1006,
        Level = LogLevel.Information,
        Message = "Registering repository of type: {RepositoryType}")]
    public static partial void LogRegisteringRepository(this ILogger logger, string? repositoryType);

    // Memory Lane Generic Repository (1007-1009)
    [LoggerMessage(
        EventId = 1007,
        Level = LogLevel.Information,
        Message = "Checked existence of {EntityType} with ID {EntityId} in {RepositoryType}: {Exists}.")]
    public static partial void LogCheckedExistence(this ILogger logger, string entityType, Guid entityId, string repositoryType, bool exists);

    [LoggerMessage(
        EventId = 1008,
        Level = LogLevel.Information,
        Message = "{EntityType} with ID {EntityId} saved in {RepositoryType}.")]
    public static partial void LogEntitySaved(this ILogger logger, string entityType, Guid entityId, string repositoryType);

    [LoggerMessage(
        EventId = 1009,
        Level = LogLevel.Information,
        Message = "{EntityType} with ID {EntityId} removed from {RepositoryType}.")]
    public static partial void LogEntityRemoved(this ILogger logger, string entityType, Guid entityId, string repositoryType);

    // Memory Lane TodoList Repository (1010)
    [LoggerMessage(
        EventId = 1010,
        Level = LogLevel.Information,
        Message = "Retrieved {Count} TodoLists for User with ID {UserId} from MemoryLaneTodoListRepository.")]
    public static partial void LogRetrievedTodoListsForUser(this ILogger logger, int count, Guid userId);

    // Entity Framework Interceptors (1011-1012)
    [LoggerMessage(
        EventId = 1011,
        Level = LogLevel.Information,
        Message = "Intercepting SavingChangesAsync to publish domain events.")]
    public static partial void LogInterceptingSavingChanges(this ILogger logger);

    [LoggerMessage(
        EventId = 1012,
        Level = LogLevel.Information,
        Message = "Intercepting SavedChangesAsync to publish queued domain events.")]
    public static partial void LogInterceptingSavedChanges(this ILogger logger);

    // User Policies (1013-1014)
    [LoggerMessage(
        EventId = 1013,
        Level = LogLevel.Information,
        Message = "All TodoLists for User with ID {UserId} locked after user deactivation.")]
    public static partial void LogTodoListsLockedAfterDeactivation(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1014,
        Level = LogLevel.Information,
        Message = "All TodoLists for User with ID {UserId} unlocked after user activation.")]
    public static partial void LogTodoListsUnlockedAfterActivation(this ILogger logger, Guid userId);

    // User Use Cases (1015-1019)
    [LoggerMessage(
        EventId = 1015,
        Level = LogLevel.Information,
        Message = "User created with ID: {UserId}")]
    public static partial void LogUserCreated(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1016,
        Level = LogLevel.Information,
        Message = "Modifying user with ID {UserId}")]
    public static partial void LogModifyingUser(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1017,
        Level = LogLevel.Information,
        Message = "User {UserId} deactivated")]
    public static partial void LogUserDeactivated(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1018,
        Level = LogLevel.Information,
        Message = "User {UserId} activated")]
    public static partial void LogUserActivated(this ILogger logger, Guid userId);

    // TodoList Use Cases (1019-1031)
    [LoggerMessage(
        EventId = 1019,
        Level = LogLevel.Information,
        Message = "TodoList {TodoListId} locked")]
    public static partial void LogTodoListLocked(this ILogger logger, Guid todoListId);

    [LoggerMessage(
        EventId = 1020,
        Level = LogLevel.Information,
        Message = "TodoItem {TodoItemId} removed from TodoList {TodoListId}")]
    public static partial void LogTodoItemRemoved(this ILogger logger, Guid todoItemId, Guid todoListId);

    [LoggerMessage(
        EventId = 1021,
        Level = LogLevel.Information,
        Message = "DueDate {DueDate} assigned to TodoItem {TodoItemId} in TodoList {TodoListId}")]
    public static partial void LogDueDateAssigned(this ILogger logger, DateTime dueDate, Guid todoItemId, Guid todoListId);

    [LoggerMessage(
        EventId = 1022,
        Level = LogLevel.Information,
        Message = "TodoList with ID {TodoListId} purged.")]
    public static partial void LogTodoListPurged(this ILogger logger, Guid todoListId);

    [LoggerMessage(
        EventId = 1023,
        Level = LogLevel.Information,
        Message = "TodoList created with ID: {TodoListId}")]
    public static partial void LogTodoListCreated(this ILogger logger, Guid todoListId);

    [LoggerMessage(
        EventId = 1024,
        Level = LogLevel.Information,
        Message = "Source TodoList with ID {SourceTodoListId} purged after merge into TodoList with ID {TargetTodoListId}.")]
    public static partial void LogSourceTodoListPurgedAfterMerge(this ILogger logger, Guid sourceTodoListId, Guid targetTodoListId);

    [LoggerMessage(
        EventId = 1025,
        Level = LogLevel.Information,
        Message = "All TodoLists for User {UserId} locked")]
    public static partial void LogAllTodoListsLocked(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1026,
        Level = LogLevel.Information,
        Message = "TodoList with ID {TodoListId} trashed.")]
    public static partial void LogTodoListTrashed(this ILogger logger, Guid todoListId);

    [LoggerMessage(
        EventId = 1027,
        Level = LogLevel.Information,
        Message = "All TodoLists for User {UserId} unlocked")]
    public static partial void LogAllTodoListsUnlocked(this ILogger logger, Guid userId);

    [LoggerMessage(
        EventId = 1028,
        Level = LogLevel.Information,
        Message = "TodoItem added with ID: {TodoItemId} to TodoList ID: {TodoListId}")]
    public static partial void LogTodoItemAdded(this ILogger logger, Guid todoItemId, Guid todoListId);

    [LoggerMessage(
        EventId = 1029,
        Level = LogLevel.Information,
        Message = "Merging TodoList ID: {SourceTodoListId} into TodoList ID: {TargetTodoListId}")]
    public static partial void LogMergingTodoLists(this ILogger logger, Guid sourceTodoListId, Guid targetTodoListId);

    [LoggerMessage(
        EventId = 1030,
        Level = LogLevel.Information,
        Message = "Merged TodoList ID: {SourceTodoListId} into TodoList ID: {TargetTodoListId}")]
    public static partial void LogMergedTodoLists(this ILogger logger, Guid sourceTodoListId, Guid targetTodoListId);

    [LoggerMessage(
        EventId = 1031,
        Level = LogLevel.Information,
        Message = "TodoItem {TodoItemId} marked as done in TodoList {TodoListId}")]
    public static partial void LogTodoItemMarkedAsDone(this ILogger logger, Guid todoItemId, Guid todoListId);

    // Domain Event Listener (1032-1033)
    [LoggerMessage(
        EventId = 1032,
        Level = LogLevel.Information,
        Message = "LISTENING for domain event of type: {EventType}")]
    public static partial void LogListeningForDomainEvent(this ILogger logger, string? eventType);

    [LoggerMessage(
        EventId = 1033,
        Level = LogLevel.Information,
        Message = "Invoking policy of type: {PolicyType} for domain event of type: {EventType}")]
    public static partial void LogInvokingPolicy(this ILogger logger, string? policyType, string? eventType);

    // Message Processor (1034)
    [LoggerMessage(
        EventId = 1034,
        Level = LogLevel.Information,
        Message = "Processing message from exchange {ExchangeName} with event {EventName} and message: {Message}")]
    public static partial void LogProcessingMessage(this ILogger logger, string exchangeName, string eventName, string message);

    // Messaging Background Worker (1035-1036)
    [LoggerMessage(
        EventId = 1035,
        Level = LogLevel.Information,
        Message = "Messaging Module is starting...")]
    public static partial void LogMessagingModuleStarting(this ILogger logger);

    [LoggerMessage(
        EventId = 1036,
        Level = LogLevel.Information,
        Message = "Messaging Module is stopping...")]
    public static partial void LogMessagingModuleStopping(this ILogger logger);

    // Warnings (1037-1038)
    [LoggerMessage(
        EventId = 1037,
        Level = LogLevel.Warning,
        Message = "No service found for policy of type: {PolicyType}")]
    public static partial void LogNoServiceFoundForPolicy(this ILogger logger, string? policyType);

    [LoggerMessage(
        EventId = 1038,
        Level = LogLevel.Warning,
        Message = "Client Error: {Title} - {Message}")]
    public static partial void LogClientError(this ILogger logger, string title, string message);

    // Errors (1039-1043)
    [LoggerMessage(
        EventId = 1039,
        Level = LogLevel.Error,
        Message = "Error invoking policy of type: {PolicyType} with message: {ErrorMessage}")]
    public static partial void LogErrorInvokingPolicy(this ILogger logger, Exception ex, string? policyType, string errorMessage);

    [LoggerMessage(
        EventId = 1040,
        Level = LogLevel.Error,
        Message = "Error while retrieving controller for operation ID {OperationId} and processing message: {Message}")]
    public static partial void LogErrorRetrievingController(this ILogger logger, Exception ex, string operationId, string message);

    [LoggerMessage(
        EventId = 1041,
        Level = LogLevel.Error,
        Message = "Error processing message from exchange {ExchangeName} with event {EventName} and message: {Message}")]
    public static partial void LogErrorProcessingMessage(this ILogger logger, Exception ex, string exchangeName, string eventName, string message);

    [LoggerMessage(
        EventId = 1042,
        Level = LogLevel.Error,
        Message = "Server Error: {Message}")]
    public static partial void LogServerError(this ILogger logger, Exception exception, string message);

    [LoggerMessage(
        EventId = 1043,
        Level = LogLevel.Error,
        Message = "Unexpected error in Messaging background loop.")]
    public static partial void LogUnexpectedErrorInMessagingLoop(this ILogger logger, Exception ex);

    // Critical (1044)
    [LoggerMessage(
        EventId = 1044,
        Level = LogLevel.Critical,
        Message = "Failed to start Messaging Module with error: {ErrorMessage}")]
    public static partial void LogFailedToStartMessagingModule(this ILogger logger, Exception ex, string errorMessage);

    // Additional Infrastructure Logging (1045-1054)
    [LoggerMessage(
        EventId = 1045,
        Level = LogLevel.Information,
        Message = "Connected to AMQP broker with host {Host}.")]
    public static partial void LogConnectedToAmqpBroker(this ILogger logger, string host);

    [LoggerMessage(
        EventId = 1046,
        Level = LogLevel.Information,
        Message = "Retrieved {Count} TodoLists for User with ID {UserId} from TodoListRepository.")]
    public static partial void LogRetrievedTodoListsForUserEf(this ILogger logger, int count, Guid userId);

    [LoggerMessage(
        EventId = 1047,
        Level = LogLevel.Information,
        Message = "Seeding initial data...")]
    public static partial void LogSeedingInitialData(this ILogger logger);

    [LoggerMessage(
        EventId = 1048,
        Level = LogLevel.Information,
        Message = "Seeding completed.")]
    public static partial void LogSeedingCompleted(this ILogger logger);

    [LoggerMessage(
        EventId = 1049,
        Level = LogLevel.Information,
        Message = "Publishing domain event of type: {EventType}")]
    public static partial void LogPublishingDomainEvent(this ILogger logger, string? eventType);

    [LoggerMessage(
        EventId = 1050,
        Level = LogLevel.Information,
        Message = "Registering domain event listener of type: {ListenerType}")]
    public static partial void LogRegisteringDomainEventListener(this ILogger logger, string? listenerType);

    [LoggerMessage(
        EventId = 1051,
        Level = LogLevel.Information,
        Message = "Invoking {Controller} for message {Message}")]
    public static partial void LogInvokingController(this ILogger logger, string controller, string message);

    // User Use Cases (1052)
    [LoggerMessage(
        EventId = 1052,
        Level = LogLevel.Information,
        Message = "Skipping user creation for {UserId} because access level '{AccessLevel}' is not permitted.")]
    public static partial void LogUserCreationSkipped(this ILogger logger, Guid userId, string accessLevel);

    [LoggerMessage(
        EventId = 1053,
        Level = LogLevel.Information,
        Message = "Skipping user activation for {UserId} because access level '{AccessLevel}' is not permitted.")]
    public static partial void LogUserActivationSkipped(this ILogger logger, Guid userId, string accessLevel);
}
