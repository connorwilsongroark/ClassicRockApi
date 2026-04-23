using ClassicRock.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Albums;

public static class AlbumsEndpoints
{
    public static IEndpointRouteBuilder MapAlbumsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/artists")
            .WithTags("Albums")
            .RequireRateLimiting("public");

            group.MapGet("/", async (
                string? q,
                int? year,
                // string? genre,
                AppDbContext db,
                CancellationToken ct
            ) =>
            {

                // Dynamically construct query based on criteria passed into request
                var query = db.Albums
                    .AsNoTracking()
                    .Include(x => x.Artist)
                    .AsQueryable();

                // If the user specified name, append that to query
                if (!string.IsNullOrWhiteSpace(q))
                {
                    query = query.Where(x =>
                        x.Title.Contains(q) || x.Artist.Name.Contains(q));
                }

                // If user specified year, append that to query
                if (year.HasValue)
                {
                    query = query.Where(x => x.ReleaseYear == year.Value);
                }

                // If user specified genre, append that to query
                // if (!string.IsNullOrWhiteSpace(genre))
                // {
                //     query = query.Where(x => x.Genre == genre);
                // }

                // Perform the query on the albums table
                var albums = await query
                    .OrderBy(x => x.Artist.Name)
                    .ThenBy(x => x.ReleaseYear)
                    .ThenBy(x => x.Title)
                    .Select(x => new AlbumsResponse(
                        x.Id,
                        x.ArtistId,
                        x.Artist.Name,
                        x.Title,
                        x.ReleaseYear,
                        // x.Genre,
                        // x.Subgenre,
                        x.CuratedScore
                    )).ToListAsync(ct);

                return Results.Ok(albums);
            });
        return app;
    }
}