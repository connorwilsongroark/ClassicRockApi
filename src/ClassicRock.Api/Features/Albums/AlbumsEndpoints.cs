using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Albums;

public static class AlbumsEndpoints
{
    public static IEndpointRouteBuilder MapAlbumsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/albums")
            .WithTags("Albums")
            .RequireRateLimiting("public");

        // ==========
        // GET
        // ==========
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

        // ==========
        // GET BY ID
        // ==========
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

        // ==========
        // POST
        // ==========
        group.MapPost("/", async (CreateAlbumRequest request, AppDbContext db, CancellationToken ct) =>
        {
            var validation = AlbumValidator.ValidateForCreate(request);

            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            var normalizedTitle = AlbumValidator.NormalizeTitle(request.Title);

            var album = new Album
            {
                Id = Guid.NewGuid(),
                Title = normalizedTitle,
                ReleaseYear = request.ReleaseYear,
                CuratedScore = request.CuratedScore
            };

            db.Albums.Add(album);
            await db.SaveChangesAsync(ct);

            return Results.CreatedAtRoute(
                "GetAlbumById",
                new { id = album.Id },
                new AlbumResponse(album.Id, album.Title, album.ReleaseYear, album.CuratedScore, PrimaryArtistName: null, PrimaryGenreName: null)
            );
        });

        // ==========
        // PUT
        // ==========
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateAlbumRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var validation = AlbumValidator.ValidateForUpdate(request);

            if (!validation.IsValid) return Results.ValidationProblem(validation.Errors);

            // Check if the album we're trying to update exists
            var album = await db.Albums.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (album is null) return Results.NotFound();

            var normalizedTitle = AlbumValidator.NormalizeTitle(request.Title);

            // Update the album
            album.Title = normalizedTitle;
            album.ReleaseYear = request.ReleaseYear;
            album.CuratedScore = request.CuratedScore;

            await db.SaveChangesAsync(ct);

            // Return the updated data
            return Results.Ok(new AlbumResponse(album.Id, album.Title, album.ReleaseYear, album.CuratedScore, PrimaryArtistName: null, PrimaryGenreName: null));
        });
        return app;
    }
}