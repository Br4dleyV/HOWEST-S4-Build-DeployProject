namespace Howestprime.Movies.ApiClient.Core;

public class ApiResult
{
    protected ApiResult(bool isSuccess, int statusCode, ApiErrorResponse? error)
    {
        IsSuccess = isSuccess;
        StatusCode = statusCode;
        Error = error;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public int StatusCode { get; }

    public ApiErrorResponse? Error { get; }

    public static ApiResult Success(int statusCode = 200) =>
        new(true, statusCode, null);

    public static ApiResult Failure(ApiErrorResponse error)
    {
        ArgumentNullException.ThrowIfNull(error);
        return new(false, error.StatusCode, error);
    }
}

public sealed class ApiResult<T> : ApiResult
{
    private ApiResult(bool isSuccess, int statusCode, T? value, ApiErrorResponse? error)
        : base(isSuccess, statusCode, error)
    {
        Value = value;
    }

    public T? Value { get; }

    public static ApiResult<T> Success(T value, int statusCode = 200) =>
        new(true, statusCode, value, null);

    public new static ApiResult<T> Failure(ApiErrorResponse error)
    {
        ArgumentNullException.ThrowIfNull(error);
        return new(false, error.StatusCode, default, error);
    }
}
