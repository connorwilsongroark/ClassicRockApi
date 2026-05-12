// Features/Dashboard/DashboardEndpoints.cs

using ClassicRock.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Dashboard;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/dashboard")
            .WithTags("Dashboard")
            .RequireRateLimiting("public");

        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var response = new DashboardResponse(
                new DashboardTotalsResponse(
                    Albums: await db.Albums.CountAsync(ct),
                    Artists: await db.Artists.CountAsync(ct),
                    Genres: await db.Genres.CountAsync(ct),
                    Tracks: await db.Tracks.CountAsync(ct)
                ),
                new DashboardNeedsAttentionResponse(
                    AlbumsWithoutArtists: await db.Albums.CountAsync(a => !a.AlbumArtists.Any(), ct),
                    AlbumsWithoutGenres: await db.Albums.CountAsync(a => !a.AlbumGenres.Any(), ct),
                    AlbumsWithoutTracks: await db.Albums.CountAsync(a => !a.AlbumTracks.Any(), ct),
                    AlbumsWithoutPrimaryGenre: await db.Albums.CountAsync(a => !a.AlbumGenres.Any(g => g.IsPrimary), ct),
                    TracksWithoutAlbums: await db.Tracks.CountAsync(t => !t.AlbumTracks.Any(), ct)
                )
            );

           
            return Results.Ok(response);
        })
        .WithName("GetDashboard")
        .WithSummary("Get dashboard summary")
        .WithDescription("Returns aggregate catalog totals and counts for records that may need administrative attention.")
        .Produces<DashboardResponse>(StatusCodes.Status200OK);

        return app;
    }
}