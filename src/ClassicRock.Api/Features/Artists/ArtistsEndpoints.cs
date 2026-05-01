using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Artists;

public static class ArtistsEndpoints
{
    public static IEndpointRouteBuilder MapArtistsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/artists")
            .WithTags("Artists")
            .RequireRateLimiting("public");

        // ==========
        // GET - Get All Artists
        // ==========
        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            {
                var artists = await db.Artists
                    .OrderBy(x => x.Name)
                    .Select(x => new ArtistResponse(x.Id, x.Name, x.Country, x.FormedYear))
                    .ToListAsync(ct);

                return Results.Ok(artists);
            });

        // ==========
        // GET - Get Artist By Id
        // ==========
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var artist = await db.Artists
                .Where(x => x.Id == id)
                .Select(x => new ArtistResponse(
                    x.Id,
                    x.Name,
                    x.Country,
                    x.FormedYear
                ))
                .FirstOrDefaultAsync(ct);

                return artist is null ? Results.NotFound() : Results.Ok(artist);
        })
        .WithName("GetArtistById");

        // =========
        // GET - Get All Albums By Artist
        // =========

        // ==========
        // POST - Create Artist
        // ==========
        group.MapPost("/", async (
            CreateArtistRequest request, 
            AppDbContext db, 
            CancellationToken ct) =>
        {
            var validation = ArtistValidator.ValidateForCreate(request);

            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            var normalizedName = ArtistValidator.NormalizeName(request.Name);
            var normalizedCountry = ArtistValidator.NormalizeCountry(request.Country);

            var artist = new Artist
            {
                Id = Guid.NewGuid(),
                Name = normalizedName,
                Country = normalizedCountry,
                FormedYear = request.FormedYear
            };

            db.Artists.Add(artist);
            await db.SaveChangesAsync(ct);

            return Results.CreatedAtRoute(
                "GetArtistById",
                new { id = artist.Id },
                new ArtistResponse(artist.Id, artist.Name, artist.Country, artist.FormedYear)
            );
        });

        // ==========
        // PUT - Update Single Artist
        // ==========
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateArtistRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var validation = ArtistValidator.ValidateForUpdate(request);

            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            // Confirm that the artist we're updating actually exists
            var artist = await db.Artists.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (artist is null) return Results.NotFound();

            // Normalize request inputs
            var normalizedName = ArtistValidator.NormalizeName(request.Name);
            var normalizedCountry = ArtistValidator.NormalizeCountry(request.Country);

            // Update the artist
            artist.Name = normalizedName;
            artist.Country = normalizedCountry;
            artist.FormedYear = request.FormedYear;

            await db.SaveChangesAsync(ct);

            // Return the updated data to the user
            return Results.Ok(new ArtistResponse(artist.Id, artist.Name, artist.Country, artist.FormedYear));
        });

        // ==========
        // DELETE - Delete a single artist
        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            // Find the artist
            var artist = await db.Artists.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (artist is null) return Results.NotFound(); 

            // Remove the artist from the table & save changes
            db.Artists.Remove(artist);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });
        return app;
    }
}