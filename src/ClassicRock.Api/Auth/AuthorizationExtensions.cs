// Auth/AuthorizationExtensions.cs

using Microsoft.AspNetCore.Authorization;

namespace ClassicRock.Api.Auth;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddApplicationAuthorization(
        this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            foreach (var permission in Permissions.All)
            {
                options.AddPolicy(permission, policy =>
                    policy.RequireClaim("permissions", permission));
            }
        });

        return services;
    }
}