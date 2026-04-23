namespace ClassicRock.Api.Infrastructure;

public sealed class ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private const string HeaderName = "X-Api-Key";

    public async Task Invoke(HttpContext context)
    {
        var exemptPaths = new[]
        {
            "/openapi",
            "/scalar",
            "/swagger"
        };

        if (exemptPaths.Any(path =>
            context.Request.Path.StartsWithSegments(path, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }

        if (context.Request.Headers.TryGetValue(HeaderName, out var apiKey) && !string.IsNullOrWhiteSpace(apiKey))
        {
            var configuredKey = configuration["ApiKeys:Default"];

            if (!string.IsNullOrWhiteSpace(configuredKey) && string.Equals(apiKey, configuredKey, StringComparison.Ordinal))
            {
                context.Items["HasApiKey"] = true;
            }
        }
        
        await next(context);
    }
}