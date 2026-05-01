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
        // POST - Create a new album
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
        // POST - Add a genre to an album
        // ==========
        group.MapPost("/{albumId:guid}/genres", async (
            Guid albumId,
            AddAlbumGenreRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            // Ensure the album exists
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);

            if (!albumExists)
            {
                return Results.NotFound(new
                { 
                    message = "Album was not found."
                });
            };

            // Ensure that that genre we're trying to assign is valid
            var genreExists = await db.Genres.AnyAsync(x => x.Id == request.GenreId, ct);

            if (!genreExists)
            {
                return Results.NotFound(new
                {
                    message = "Genre was not found."
                });
            }

            // Check if the relationship between the album and the genre already exists
            var relationshipExists = await db.AlbumGenres.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.GenreId == request.GenreId,
                ct);

            if (relationshipExists)
            {
                return Results.Conflict( new
                {
                    message = "This genre is already associated with this album."
                });
            }

            // Check if the album already has a primary genre
            if (request.IsPrimary)
            {
                var primaryAlreadyExists = await db.AlbumGenres.AnyAsync(x => 
                x.AlbumId == albumId &&
                x.IsPrimary, 
                ct);

                if (primaryAlreadyExists)
                {
                    return Results.Conflict(new
                    {
                        message = "This album already has a primary genre."
                    });
                }
            }

            var albumGenre = new AlbumGenre
            {
                AlbumId = albumId,
                GenreId = request.GenreId,
                IsPrimary = request.IsPrimary
            };

            db.AlbumGenres.Add(albumGenre);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // ==========
        // POST - Add an artist to an album
        // ==========
        group.MapPost("/{albumId:guid}/artists", async (
            Guid albumId,
            AddAlbumArtistRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            // Ensure that the album exists
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);
            if (!albumExists) return Results.NotFound(new
            {
               message = "Album not found." 
            });

            // Ensure that the artist exists
            var artistExists = await db.Artists.AnyAsync(x => x.Id == request.ArtistId, ct);
            if (!artistExists) return Results.NotFound(new
            {
                message = "Artist not found."
            });

            // Check if the role is valid
            if (!Enum.IsDefined(request.Role))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                   ["role"] = ["Role is not valid."] 
                });
            }

            // Check if the relationship already exists
            var relationshipExists = await db.AlbumArtists.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.ArtistId == request.ArtistId,
                ct);

            if (relationshipExists) return Results.Conflict(new
            {
                message = "This artist is already associated with this album."
            });

            // Check if there's already a primary artist on the album if we're trying to set one
            if (request.Role == AlbumArtistRole.Primary)
            {
                var primaryAlreadyExists = await db.AlbumArtists.AnyAsync(x =>
                    x.AlbumId == albumId &&
                    x.Role == AlbumArtistRole.Primary,
                    ct);

                if (primaryAlreadyExists) return Results.Conflict(new
                {
                    message = "This album already has a primary artist."
                });
            }

            // Create the artist & album entry.
            var albumArtist = new AlbumArtist
            {
                AlbumId = albumId,
                ArtistId = request.ArtistId,
                Role = request.Role,
            };

            db.AlbumArtists.Add(albumArtist);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // ==========
        // POST - Add a track to an album
        // ==========
        group.MapPost("/{albumId:guid}/tracks", async (
            Guid albumId,
            AddAlbumTrackRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            // Ensure that the album exists
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);
            if (!albumExists) return Results.NotFound(new
            {
               message = "Album not found." 
            });

            // Ensure that the track exists
            var trackExists = await db.Tracks.AnyAsync(x => x.Id == request.TrackId, ct);
            if (!trackExists) return Results.NotFound(new 
            {
                message = "Track not found."
            });

            // Check that the track number is valid
            if (request.TrackNumber <= 0) return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["trackNumber"] = ["Track number is not valid."]
            });

            // Check if the relationship already exists
            var relationshipExists = await db.AlbumTracks.AnyAsync(x => 
                x.AlbumId == albumId &&
                x.TrackId == request.TrackId,
                ct);
            if (relationshipExists) return Results.Conflict(new
            {
                message = "This track is already associated with this album."
            });

            // Check that the track number is not already taken for this album
            var trackNumberExists = await db.AlbumTracks.AnyAsync(x => 
            x.AlbumId == albumId &&
            x.TrackNumber == request.TrackNumber, 
            ct);
            if (trackNumberExists)
            {
                return Results.Conflict(new
                {
                    message = "This track number is already taken for this album."
                });
            }

            var albumTrack = new AlbumTrack
            {
                AlbumId = albumId,
                TrackId = request.TrackId,
                TrackNumber = request.TrackNumber
            };

            db.AlbumTracks.Add(albumTrack);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // ==========
        // PUT - Update a single album
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

        // =========
        // DELETE - Delete a single album
        // =========
        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            // Fetch the album by ID
            var album = await db.Albums.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (album is null) return Results.NotFound();

            // Remove the album & save
            db.Albums.Remove(album);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });
        return app;
    }
}