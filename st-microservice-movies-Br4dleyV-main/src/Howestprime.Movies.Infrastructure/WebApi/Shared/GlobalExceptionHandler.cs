using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Shared.Exceptions;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.WebApi.Shared;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            BadHttpRequestException
                => (StatusCodes.Status400BadRequest, "Bad Request"),
            ValidationException or ArgumentException or ArgumentNullException 
                => (StatusCodes.Status422UnprocessableEntity, "Validation Error"),
            NotFoundException 
                => (StatusCodes.Status404NotFound, "Not Found"),
            UnauthorizedAccessException
                => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            InvalidOperationException 
                => (StatusCodes.Status409Conflict, "Conflict"),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            logger.LogServerError(exception, exception.Message);
        else
            logger.LogClientError(title, exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true; 
    }
}