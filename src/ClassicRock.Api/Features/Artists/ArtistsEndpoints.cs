using ClassicRock.Api.Auth;
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
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new ArtistResponse(x.Id, x.Name, x.Country, x.FormedYear))
                .ToListAsync(ct);

            return Results.Ok(artists);
        })
        .WithSummary("Get all artists")
        .WithDescription("Returns a lightweight list of all artists ordered by name.")
        .Produces<List<ArtistResponse>>(StatusCodes.Status200OK);

        // ==========
        // GET - Get Artist By Id
        // ==========
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var artist = await db.Artists
                .AsNoTracking()
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
        .WithName("GetArtistById")
        .WithSummary("Get an artist by ID")
        .WithDescription("Returns a single artist by its unique identifier.")
        .Produces<ArtistResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

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
        })
        .RequireAuthorization(Permissions.CreateArtists)
        .WithSummary("Create an artist")
        .WithDescription("Creates a new artist and returns the created resource.")
        .Produces<ArtistResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.UpdateArtists)
        .WithSummary("Update an artist")
        .WithDescription("Updates the name, country, and formed year for an existing artist.")
        .Produces<ArtistResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.DeleteArtists)
        .WithSummary("Delete an artist")
        .WithDescription("Deletes an artist and removes its album/genre associations through configured cascade behavior.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        return app;
    }
}