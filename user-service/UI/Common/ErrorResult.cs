using Application.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UI.Common;

public static class ErrorResult
{
    public static BadRequest<ErrorResponse> Create(string errorMessage)
    {
        return TypedResults.BadRequest(new ErrorResponse(errorMessage));
    }
}
