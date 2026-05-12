using ClassicRock.Api.Data;
using ClassicRock.Api.Features.Albums;
using ClassicRock.Api.Features.Artists;
using ClassicRock.Api.Features.Dashboard;
using ClassicRock.Api.Features.Genres;
using ClassicRock.Api.Features.Tracks;
using ClassicRock.Api.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using ClassicRock.Api.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add the EF Core DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // Using SQL Server implementation for now. Swap to cloud later.
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
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

// Add Auth
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth0:Authority"];
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

// we're using a custom auth extension method, so use this
builder.Services.AddApplicationAuthorization();

// Add CORS
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("admin-dashboard", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseMiddleware<ApiKeyMiddleware>();

app.UseRateLimiter();

app.UseCors("admin-dashboard");

app.UseAuthentication();
app.UseAuthorization();

// Map endpoints
app.MapDashboardEndpoints();
app.MapArtistsEndpoints();
app.MapAlbumsEndpoints();
app.MapGenresEndpoints();
app.MapTracksEndpoints();

app.Run();

public partial class Program { }