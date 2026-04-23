using ClassicRock.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Artists;

public static class ArtistsEndpoints
{
    public static IEndpointRouteBuilder MapArtistsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/artists")
            .WithTags("Artists")
            .RequireRateLimiting("public");

            group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            {
                var artists = await db.Artists
                    .OrderBy(x => x.Name)
                    .Select(x => new ArtistResponse(x.Id, x.Name, x.Country, x.FormedYear))
                    .ToListAsync(ct);
            });

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
            });

            return app;
    }
}