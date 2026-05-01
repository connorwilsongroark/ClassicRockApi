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
        });

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
        }).WithName("GetTrackById");

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
        });

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
        });

        // ==========
        // DELETE - Delete single track
        // ==========
        group.MapDelete("/", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            // Find the track
            var track = await db.Tracks.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (track is null) return Results.NotFound(); 

            // Remove the track & save
            db.Tracks.Remove(track);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });
        return app;
    }
}