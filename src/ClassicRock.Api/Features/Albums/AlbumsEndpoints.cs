using System.Security.Claims;
using ClassicRock.Api.Auth;
using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;
using ClassicRock.Api.Features.Audit;
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
        })
        .WithSummary("Get all albums")
        .WithDescription("Returns a lightweight list of albums with primary artist and genre.")
        .Produces<List<AlbumResponse>>(StatusCodes.Status200OK);

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
                        .ToList(),
                    
                    x.AlbumTracks
                        .OrderBy(at => at.TrackNumber)
                        .ThenBy(at => at.Track.Name)
                        .Select(at => new AlbumTrackResponse(
                            at.TrackId,
                            at.Track.Name,
                            at.Track.Duration,
                            at.TrackNumber
                        ))
                        .ToList()
                ))
                .FirstOrDefaultAsync(ct);

            return album is null
                ? Results.NotFound(new
                {
                    message = "Could not find an album with this ID."
                })
                : Results.Ok(album);
        })
        .WithName("GetAlbumById")
        .WithSummary("Get album by ID")
        .WithDescription("Returns full album details including artists and genres.")
        .Produces<AlbumDetailResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (
            CreateAlbumRequest request,
            AppDbContext db,
            AuditLogger auditLogger,
            ClaimsPrincipal user,
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

            // Audit Album Creation
            auditLogger.Add(
                user,
                action: "Created",
                entityType: "Album",
                entityId: album.Id.ToString(),
                details: new
                {
                    album.Id,
                    album.Title,
                    album.ReleaseYear,
                    album.CuratedScore
                });

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
        })
        .RequireAuthorization(Permissions.CreateAlbums)
        .WithSummary("Create an album")
        .WithDescription("Creates a new album.")
        .Produces<AlbumResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
                return Results.NotFound(new
                {
                    message = "Could not find an album with this ID."
                });
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
        })
        .RequireAuthorization(Permissions.UpdateAlbums)
        .WithSummary("Update an album")
        .WithDescription("Updates album details.")
        .Produces<AlbumResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.DeleteAlbums)
        .WithSummary("Delete an album")
        .WithDescription("Deletes an album and removes all related associations.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumArtists)
        .WithSummary("Add an artist to an album")
        .WithDescription("Creates an association between an album and an artist with an artist ID.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumArtists)
        .WithSummary("Update album artist")
        .WithDescription("Updates artist metadata such as the artist's role on a specific album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumArtists)
        .WithSummary("Remove artist from album")
        .WithDescription("Removes the association between an artist and an album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumGenres)
        .WithSummary("Add a genre to an album")
        .WithDescription("Creates an association between an album and a genre with a genre ID.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
                        x.GenreId != genreId &&
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
        })
        .RequireAuthorization(Permissions.ManageAlbumGenres)
        .WithSummary("Update album genre")
        .WithDescription("Updates genre metadata such as whether or not it's the primary genre for a specific album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumGenres)
        .WithSummary("Remove genre from album")
        .WithDescription("Removes the association between a genre and an album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumTracks)
        .WithSummary("Add a track to an album")
        .WithDescription("Creates an association between an album and a track with a track ID.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumTracks)
        .WithSummary("Update album track")
        .WithDescription("Updates track metadata such as track number for a specific album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

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
        })
        .RequireAuthorization(Permissions.ManageAlbumTracks)
        .WithSummary("Remove track from album")
        .WithDescription("Removes the association between a track and an album.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        // =====================
        // Album Browsing
        // =====================
group.MapGet("/browse", async (
    [AsParameters] AlbumBrowseQuery query,
    AppDbContext db,
    CancellationToken ct
    ) =>
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => query.PageSize
        };

        var albumsQuery = db.Albums
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Artist))
        {
            var artist = query.Artist.Trim().ToLower();

            albumsQuery = albumsQuery.Where(album =>
                album.AlbumArtists.Any(aa =>
                    aa.Artist.Name.ToLower().Contains(artist)));
        }

        if (!string.IsNullOrWhiteSpace(query.Genre))
        {
            var genre = query.Genre.Trim().ToLower();

            albumsQuery = albumsQuery.Where(album =>
                album.AlbumGenres.Any(ag =>
                    ag.Genre.Name.ToLower().Contains(genre)));
        }

        if (query.ReleaseYear is not null)
        {
            albumsQuery = albumsQuery.Where(album =>
                album.ReleaseYear == query.ReleaseYear);
        }

        if (query.Decade is not null)
        {
            var decadeStart = query.Decade.Value;
            var decadeEnd = decadeStart + 9;

            albumsQuery = albumsQuery.Where(album =>
                album.ReleaseYear >= decadeStart &&
                album.ReleaseYear <= decadeEnd);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            albumsQuery = albumsQuery.Where(album =>
                album.Title.ToLower().Contains(search) ||
                album.AlbumArtists.Any(aa =>
                    aa.Artist.Name.ToLower().Contains(search)) ||
                album.AlbumGenres.Any(ag =>
                    ag.Genre.Name.ToLower().Contains(search)));
        }

        albumsQuery = query.Sort?.ToLower() switch
        {
            "title" => albumsQuery.OrderBy(album => album.Title),
            "title_desc" => albumsQuery.OrderByDescending(album => album.Title),

            "releaseyear" => albumsQuery.OrderBy(album => album.ReleaseYear),
            "releaseyear_desc" => albumsQuery.OrderByDescending(album => album.ReleaseYear),

            "score" => albumsQuery.OrderBy(album => album.CuratedScore),
            "score_desc" => albumsQuery.OrderByDescending(album => album.CuratedScore),

            _ => albumsQuery.OrderBy(album => album.Title)
        };

        var totalCount = await albumsQuery.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var albums = await albumsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(album => new AlbumBrowseResponse(
                album.Id,
                album.Title,
                album.ReleaseYear,
                album.CuratedScore,
                album.AlbumArtists
                    .OrderBy(aa => aa.Role)
                    .ThenBy(aa => aa.Artist.Name)
                    .Select(aa => aa.Artist.Name)
                    .ToList(),
                album.AlbumGenres
                    .OrderByDescending(ag => ag.IsPrimary)
                    .ThenBy(ag => ag.Genre.Name)
                    .Select(ag => ag.Genre.Name)
                    .ToList()
            ))
            .ToListAsync(ct);

        return Results.Ok(new PagedResponse<AlbumBrowseResponse>(
            albums,
            page,
            pageSize,
            totalCount,
            totalPages
        ));
    })
    .WithName("BrowseAlbums")
    .WithSummary("Browse albums")
    .WithDescription("Returns a paginated list of albums with optional filtering, searching, and sorting.")
    .Produces<PagedResponse<AlbumBrowseResponse>>(StatusCodes.Status200OK);

    group.MapPost("/quick-add", async (
        QuickAddAlbumRequest request,
        AppDbContext db,
        AuditLogger auditLogger,
        ClaimsPrincipal user,
        CancellationToken ct
    ) =>
    {
        var albumValidation = AlbumValidator.ValidateForCreate(
            new CreateAlbumRequest(
                request.Title,
                request.ReleaseYear,
                request.CuratedScore
            )
        );

        if (!albumValidation.IsValid) return Results.ValidationProblem(albumValidation.Errors);

        if (request.Tracks is null || request.Tracks.Count == 0)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["tracks"] = ["At least one track is required."]
            });
        }

        // Check each track in the request for any errors / invalid arguments
        var trackErrors = new Dictionary<string, string[]>();
        for (var i = 0; i < request.Tracks.Count; i++)
        {
            var track = request.Tracks[i];
            if (string.IsNullOrWhiteSpace(track.Name))
            {
                trackErrors[$"tracks[{i}].name"] = ["Track name is required."];
            }
            if (track.Duration < TimeSpan.Zero)
            {
                trackErrors[$"tracks[{i}].duration"] = ["Track duration cannot be negative."];
            }
        }

        if (trackErrors.Count > 0)
        {
            return Results.ValidationProblem(trackErrors);
        }

        // Start new DB transaction to ensure mutation is atomic
        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        // Add the album to the table
        var album = new Album
        {
            Id = Guid.NewGuid(),
            Title = AlbumValidator.NormalizeTitle(request.Title),
            ReleaseYear = request.ReleaseYear,
            CuratedScore = request.CuratedScore  
        };
        db.Albums.Add(album);

        // Add the tracks to the table
        var albumTrackResponses = new List<AlbumTrackResponse>();
        for (var i = 0; i < request.Tracks.Count; i++)
        {
            var requestTrack = request.Tracks[i];
            var trackNumber = i + 1;

            var track = new Track
            {
                Id = Guid.NewGuid(),
                Name = requestTrack.Name.Trim(),
                Duration = requestTrack.Duration
            };

            db.Tracks.Add(track);
            // Add the album -> track associations
            db.AlbumTracks.Add(new AlbumTrack
            {
                AlbumId = album.Id,
                TrackId = track.Id,
                TrackNumber = trackNumber
            });

            albumTrackResponses.Add(new AlbumTrackResponse(
                track.Id, track.Name, track.Duration, trackNumber
            ));
        }

        auditLogger.Add(
            user,
            action: "QuickAdded",
            entityType: "Album",
            entityId: album.Id.ToString(),
            details: new
            {
                album.Id,
                album.Title,
                album.ReleaseYear,
                album.CuratedScore,
                TrackCount = request.Tracks.Count
            }
        );

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Results.CreatedAtRoute(
            "GetAlbumById",
            new { id = album.Id },
            new QuickAddAlbumResponse(
                album.Id,
                album.Title,
                album.ReleaseYear,
                album.CuratedScore,
                albumTrackResponses
            )
        );
    })
    .RequireAuthorization(
        Permissions.CreateAlbums,
        Permissions.CreateTracks,
        Permissions.ManageAlbumTracks
    )
    .WithSummary("Quick-add an album with tracks")
    .WithDescription("Creates an album, creates new tracks, and associates those tracks with the album in one step. Track numbers are assigned based on the order of the tracks in the request.")
    .Produces<QuickAddAlbumResponse>(StatusCodes.Status201Created)
    .ProducesValidationProblem()
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status403Forbidden);

        return app;
    }
}