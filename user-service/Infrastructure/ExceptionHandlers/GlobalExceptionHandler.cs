using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.ExceptionHandlers;

// Alternatively, you can use the IExceptionHandler interface from Carter library
public class GlobalExceptionHandler: IExceptionHandler
{
    private readonly ILogger _logger;
    public GlobalExceptionHandler(ILogger logger)
    {
        _logger = logger;
    }
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception");
        httpContext.Response.ContentType = "application/json";
        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
  
        var error = new
        {
            message = "Something went wrong.",
            title = "Internal Server Error",
            detail = "Unexpected error occurred. Please try again later."
        };
        var json = JsonSerializer.Serialize(error);
        await httpContext.Response.WriteAsync(json, cancellationToken);
        return true; // Indicating that the exception was handled
    }
}