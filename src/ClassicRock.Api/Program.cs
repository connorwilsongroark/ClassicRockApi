using ClassicRock.Api.Data;
using ClassicRock.Api.Features.Albums;
using ClassicRock.Api.Features.Artists;
using ClassicRock.Api.Features.Genres;
using ClassicRock.Api.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Add the EF Core DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // Using SQL Server implementation for now. Swap to cloud later.
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection"));
});

// Add rate limiting settings
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Limiter for public requests
    options.AddFixedWindowLimiter("public", limiterOptions =>
    {
        limiterOptions.PermitLimit = 20;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
        limiterOptions.AutoReplenishment = true;
    });

    // Limiter for requests w/ API key
    options.AddFixedWindowLimiter("apiKey", limiterOptions =>
    {
        limiterOptions.PermitLimit = 120;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
        limiterOptions.AutoReplenishment = true;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseMiddleware<ApiKeyMiddleware>();

app.UseRateLimiter();

// Map endpoints
app.MapArtistsEndpoints();
app.MapAlbumsEndpoints();
app.MapGenresEndpoints();

app.Run();

public partial class Program { }