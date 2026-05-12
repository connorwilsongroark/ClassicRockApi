using ClassicRock.Api.Auth;
using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Tracks;

public static class TracksEndpoints
{
    public static IEndpointRouteBuilder MapTracksEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/tracks")
            .WithTags("Tracks")
            .RequireRateLimiting("public");

        // ==========
        // GET - Get all tracks
        // ==========
        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var tracks = await db.Tracks
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new TrackResponse(x.Id, x.Name, x.Duration))
                .ToListAsync(ct);

            return Results.Ok(tracks);
        })
        .WithSummary("Get all tracks")
        .WithDescription("Returns a lightweight list of all tracks ordered by name.")
        .Produces<List<TrackResponse>>(StatusCodes.Status200OK);

        // ==========
        // GET - Get tracks by ID
        // ==========
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var track = await db.Tracks
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new TrackResponse(x.Id, x.Name, x.Duration))
            .FirstOrDefaultAsync(ct);

            return track is null
                ? Results.NotFound()
                : Results.Ok(track);
        })
        .WithName("GetTrackById")
        .WithSummary("Get a track by ID")
        .WithDescription("Returns a single track by its unique ID")
        .Produces<TrackResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // ==========
        // POST - Create new tracks
        // ==========
        group.MapPost("/", async (CreateTrackRequest request, AppDbContext db, CancellationToken ct) =>
        {
            var validation = TrackValidator.ValidateForCreate(request);

            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            var normalizedName = TrackValidator.NormalizeName(request.Name);
            var normalizedDuration = TrackValidator.NormalizeDuration(request.Duration);

            var track = new Track
            {
                Id = Guid.NewGuid(),
                Name = normalizedName,
                Duration = normalizedDuration
            };

            db.Tracks.Add(track);
            await db.SaveChangesAsync(ct);

            return Results.CreatedAtRoute(
                "GetTrackById",
                new { id = track.Id},
                new TrackResponse(track.Id, track.Name, track.Duration)
            );
        })
        .RequireAuthorization(Permissions.CreateTracks)
        .WithSummary("Create a track")
        .WithDescription("Creates a new track and returns the created resource.")
        .Produces<TrackResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        // ==========
        // PUT - Update single track details
        // ==========
        group.MapPut("/{id:guid}", async (Guid id, UpdateTrackRequest request, AppDbContext db, CancellationToken ct) =>
        {
            var validation = TrackValidator.ValidateForUpdate(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            // Confirm that the track exists
            var track = await db.Tracks.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (track is null) return Results.NotFound(new {
                message = "Track not found."
            });

            // Normalize request fields
            var normalizedName = TrackValidator.NormalizeName(request.Name);
            var normalizedDuration = TrackValidator.NormalizeDuration(request.Duration);
            
            // Update the track
            track.Name = normalizedName;
            track.Duration = normalizedDuration;

            await db.SaveChangesAsync(ct);

            return Results.Ok(new TrackResponse(track.Id, track.Name, track.Duration));
        })
        .RequireAuthorization(Permissions.UpdateTracks)
        .WithSummary("Update a track")
        .WithDescription("Updates the name and duration for an existing track.")
        .Produces<TrackResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        // ==========
        // DELETE - Delete single track
        // ==========
        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            // Find the track
            var track = await db.Tracks.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (track is null) return Results.NotFound(); 

            // Remove the track & save
            db.Tracks.Remove(track);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        })
        .RequireAuthorization(Permissions.DeleteTracks)
        .WithSummary("Delete a track")
        .WithDescription("Deletes a track and removes any album-track associations through configured cascade behavior.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);
        
        return app;
    }
}