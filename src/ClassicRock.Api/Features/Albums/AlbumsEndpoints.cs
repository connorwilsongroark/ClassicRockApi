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

        // =====================
        // Album CRUD
        // =====================

        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
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
                ))
                .FirstOrDefaultAsync(ct);

            return album is null
                ? Results.NotFound()
                : Results.Ok(album);
        })
        .WithName("GetAlbumById");

        group.MapPost("/", async (
            CreateAlbumRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var validation = AlbumValidator.ValidateForCreate(request);

            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.Errors);
            }

            var album = new Album
            {
                Id = Guid.NewGuid(),
                Title = AlbumValidator.NormalizeTitle(request.Title),
                ReleaseYear = request.ReleaseYear,
                CuratedScore = request.CuratedScore
            };

            db.Albums.Add(album);
            await db.SaveChangesAsync(ct);

            return Results.CreatedAtRoute(
                "GetAlbumById",
                new { id = album.Id },
                new AlbumResponse(
                    album.Id,
                    album.Title,
                    album.ReleaseYear,
                    album.CuratedScore,
                    PrimaryArtistName: null,
                    PrimaryGenreName: null
                )
            );
        });

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateAlbumRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var validation = AlbumValidator.ValidateForUpdate(request);

            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.Errors);
            }

            var album = await db.Albums.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (album is null)
            {
                return Results.NotFound();
            }

            album.Title = AlbumValidator.NormalizeTitle(request.Title);
            album.ReleaseYear = request.ReleaseYear;
            album.CuratedScore = request.CuratedScore;

            await db.SaveChangesAsync(ct);

            return Results.Ok(new AlbumResponse(
                album.Id,
                album.Title,
                album.ReleaseYear,
                album.CuratedScore,
                PrimaryArtistName: null,
                PrimaryGenreName: null
            ));
        });

        group.MapDelete("/{id:guid}", async (
            Guid id,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var album = await db.Albums.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (album is null)
            {
                return Results.NotFound();
            }

            db.Albums.Remove(album);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // =====================
        // Album Artists
        // =====================

        group.MapPost("/{albumId:guid}/artists", async (
            Guid albumId,
            AddAlbumArtistRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);

            if (!albumExists)
            {
                return Results.NotFound(new { message = "Album not found." });
            }

            var artistExists = await db.Artists.AnyAsync(x => x.Id == request.ArtistId, ct);

            if (!artistExists)
            {
                return Results.NotFound(new { message = "Artist not found." });
            }

            if (!Enum.IsDefined(request.Role))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["role"] = ["Role is not valid."]
                });
            }

            var relationshipExists = await db.AlbumArtists.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.ArtistId == request.ArtistId,
                ct);

            if (relationshipExists)
            {
                return Results.Conflict(new
                {
                    message = "This artist is already associated with this album."
                });
            }

            if (request.Role == AlbumArtistRole.Primary)
            {
                var primaryAlreadyExists = await db.AlbumArtists.AnyAsync(x =>
                    x.AlbumId == albumId &&
                    x.Role == AlbumArtistRole.Primary,
                    ct);

                if (primaryAlreadyExists)
                {
                    return Results.Conflict(new
                    {
                        message = "This album already has a primary artist."
                    });
                }
            }

            db.AlbumArtists.Add(new AlbumArtist
            {
                AlbumId = albumId,
                ArtistId = request.ArtistId,
                Role = request.Role
            });

            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapPut("/{albumId:guid}/artists/{artistId:guid}", async (Guid albumId, Guid artistId, UpdateAlbumArtistRequest request, AppDbContext db, CancellationToken ct) =>
        {
            // Validate the supplied role is valid
            if (!Enum.IsDefined(request.Role))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["role"] = ["Role is not valid."]
                });
            }

            //  Find the existing relationship
            var albumArtist = await db.AlbumArtists.FirstOrDefaultAsync(x =>
                x.AlbumId == albumId &&
                x.ArtistId == artistId,
                ct);
            
            if (albumArtist is null)
            {
                return Results.NotFound(new
                {
                    message = "This artist is not associated with this album"
                });
            }

            // Stop the user if they're trying to assign another primary
            if (request.Role == AlbumArtistRole.Primary)
            {
                var primaryAlreadyExists = await db.AlbumArtists.AnyAsync(x =>
                    x.AlbumId == albumId &&
                    x.ArtistId != artistId &&
                    x.Role == AlbumArtistRole.Primary,
                    ct);
                
                if (primaryAlreadyExists) return Results.Conflict(new
                {
                    message = "This album already has a primary artist."
                });
            }

            // Update the role
            albumArtist.Role = request.Role;
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapDelete("/{albumId:guid}/artists/{artistId:guid}", async (
            Guid albumId,
            Guid artistId,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumArtist = await db.AlbumArtists.FirstOrDefaultAsync(x =>
                x.AlbumId == albumId &&
                x.ArtistId == artistId,
                ct);

            if (albumArtist is null)
            {
                return Results.NotFound(new
                {
                    message = "This artist is not associated with this album."
                });
            }

            db.AlbumArtists.Remove(albumArtist);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // =====================
        // Album Genres
        // =====================

        group.MapPost("/{albumId:guid}/genres", async (
            Guid albumId,
            AddAlbumGenreRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);

            if (!albumExists)
            {
                return Results.NotFound(new { message = "Album not found." });
            }

            var genreExists = await db.Genres.AnyAsync(x => x.Id == request.GenreId, ct);

            if (!genreExists)
            {
                return Results.NotFound(new { message = "Genre not found." });
            }

            var relationshipExists = await db.AlbumGenres.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.GenreId == request.GenreId,
                ct);

            if (relationshipExists)
            {
                return Results.Conflict(new
                {
                    message = "This genre is already associated with this album."
                });
            }

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

            db.AlbumGenres.Add(new AlbumGenre
            {
                AlbumId = albumId,
                GenreId = request.GenreId,
                IsPrimary = request.IsPrimary
            });

            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapPut("/{albumId:guid}/genres/{genreId:guid}", async (Guid albumId, Guid genreId, UpdateAlbumGenreRequest request, AppDbContext db, CancellationToken ct) =>
        {
            
            // Verify the association exists
            var albumGenre = await db.AlbumGenres.FirstOrDefaultAsync(x =>
            x.AlbumId == albumId &&
            x.GenreId == genreId,
            ct);
            if (albumGenre is null) return Results.NotFound(new
            {
                message = "This genre is not associated with this album"
            });

            // Set the current genres for this album to be NOT primary
            if (request.IsPrimary)
            {
                var currentPrimaryGenres = await db.AlbumGenres
                    .Where(x =>
                        x.AlbumId == albumId &&
                        x.GenreId == genreId &&
                        x.IsPrimary)
                    .ToListAsync(ct);
                
                foreach (var currentPrimaryGenre in currentPrimaryGenres)
                {
                    currentPrimaryGenre.IsPrimary = false;
                }
            }

            // Update the association
            albumGenre.IsPrimary = request.IsPrimary;

            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapDelete("/{albumId:guid}/genres/{genreId:guid}", async (
            Guid albumId,
            Guid genreId,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumGenre = await db.AlbumGenres.FirstOrDefaultAsync(x =>
                x.AlbumId == albumId &&
                x.GenreId == genreId,
                ct);

            if (albumGenre is null)
            {
                return Results.NotFound(new
                {
                    message = "This genre is not associated with this album."
                });
            }

            db.AlbumGenres.Remove(albumGenre);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        // =====================
        // Album Tracks
        // =====================

        group.MapPost("/{albumId:guid}/tracks", async (
            Guid albumId,
            AddAlbumTrackRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumExists = await db.Albums.AnyAsync(x => x.Id == albumId, ct);

            if (!albumExists)
            {
                return Results.NotFound(new { message = "Album not found." });
            }

            var trackExists = await db.Tracks.AnyAsync(x => x.Id == request.TrackId, ct);

            if (!trackExists)
            {
                return Results.NotFound(new { message = "Track not found." });
            }

            if (request.TrackNumber <= 0)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["trackNumber"] = ["Track number is not valid."]
                });
            }

            var relationshipExists = await db.AlbumTracks.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.TrackId == request.TrackId,
                ct);

            if (relationshipExists)
            {
                return Results.Conflict(new
                {
                    message = "This track is already associated with this album."
                });
            }

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

            db.AlbumTracks.Add(new AlbumTrack
            {
                AlbumId = albumId,
                TrackId = request.TrackId,
                TrackNumber = request.TrackNumber
            });

            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapPut("/{albumId:guid}/tracks/{trackId:guid}", async (Guid albumId, Guid trackId, UpdateAlbumTrackRequest request, AppDbContext db, CancellationToken ct) =>
        {
            // Verify that the track number is valid
            if (request.TrackNumber <= 0)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["trackNumber"] = ["Track number is not valid."]
                });
            }

            // Verify that the association exists
            var albumTrack = await db.AlbumTracks.FirstOrDefaultAsync(x =>
                x.AlbumId == albumId &&
                x.TrackId == trackId,
                ct);
            if (albumTrack is null) return Results.NotFound(new
            {
                message = "This track is not associated with this album."
            });

            // Verify that the track number is not occupied by any existing tracks on this album
            var trackNumberExists = await db.AlbumTracks.AnyAsync(x =>
                x.AlbumId == albumId &&
                x.TrackId != trackId &&
                x.TrackNumber == request.TrackNumber,
                ct);
            if (trackNumberExists) return Results.Conflict(new
            {
                message = "This track number is already taken for this album."
            });

            // Update the association
            albumTrack.TrackNumber = request.TrackNumber;
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        group.MapDelete("/{albumId:guid}/tracks/{trackId:guid}", async (
            Guid albumId,
            Guid trackId,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var albumTrack = await db.AlbumTracks.FirstOrDefaultAsync(x =>
                x.AlbumId == albumId &&
                x.TrackId == trackId,
                ct);

            if (albumTrack is null)
            {
                return Results.NotFound(new
                {
                    message = "This track is not associated with this album."
                });
            }

            db.AlbumTracks.Remove(albumTrack);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        });

        return app;
    }
}