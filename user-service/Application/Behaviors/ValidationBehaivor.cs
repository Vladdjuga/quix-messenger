using Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull, IRequest<TResponse>
    where TResponse:IResult
{
    private readonly ILogger _logger;
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    public ValidationBehavior(ILogger<ValidationBehavior<TRequest, TResponse>> logger,
        IEnumerable<IValidator<TRequest>> validators)
    {
        _logger = logger;
        _validators = validators;
    }
    public async Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken)
    {
        var context = new ValidationContext<TRequest>(request);

        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count == 0) return await next();
        var failuresString = failures.Aggregate("Validation failed: \n", (current, failure) => current + (failure.ErrorMessage + '\n'));
        var responseType = typeof(TResponse);
        if (responseType == typeof(Result))
            return (TResponse)Result.Failure(failuresString);
        if (!responseType.IsGenericType || responseType.GetGenericTypeDefinition() != typeof(Result<>))
            return await next();
        var failureMethod = responseType.GetMethod("Failure", [typeof(string)]);
        if (failureMethod is null) return await next();
        var failureResult = failureMethod.Invoke(null, [failuresString]);
        return (TResponse)failureResult!;
    }
}