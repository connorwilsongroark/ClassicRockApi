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

        // Keep this list endpoint light
        group.MapGet("/", async (
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albums = await db.Albums
                .AsNoTracking()
                .OrderBy(x => x.Title)
                .Select(x => new AlbumResponse(
                    x.Id,
                    x.Title,
                    x.ReleaseYear,
                    x.CuratedScore,
                    x.AlbumArtists
                        .Where(aa => aa.Role == AlbumArtistRole.Primary)
                        .Select(aa => aa.Artist.Name)
                        .FirstOrDefault(),
                    x.AlbumGenres
                        .Where(ag => ag.IsPrimary)
                        .Select(ag => ag.Genre.Name)
                        .FirstOrDefault()
                ))
                .ToListAsync(ct);

                return Results.Ok(albums);
        });

        group.MapGet("/{id:guid}", async (
            Guid id,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var album = await db.Albums
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new AlbumDetailResponse(
                    x.Id,
                    x.Title,
                    x.ReleaseYear,
                    x.CuratedScore,
                    x.AlbumArtists
                        .OrderBy(aa => aa.Role)
                        .ThenBy(aa => aa.Artist.Name)
                        .Select(aa => new AlbumArtistResponse(
                            aa.ArtistId,
                            aa.Artist.Name,
                            aa.Role
                        ))
                        .ToList(),
                    x.AlbumGenres
                        .OrderByDescending(ag => ag.IsPrimary)
                        .ThenBy(ag => ag.Genre.Name)
                        .Select(ag => new AlbumGenreResponse(
                            ag.GenreId,
                            ag.Genre.Name,
                            ag.IsPrimary
                        ))
                        .ToList()
                )).FirstOrDefaultAsync(ct);
            
            return album is null
                ? Results.NotFound()
                : Results.Ok(album);
        }).WithName("GetAlbumById");
        return app;
    }
}