namespace ClassicRock.Api.Features.Dashboard;

public sealed record DashboardResponse(
    DashboardTotalsResponse Totals,
    DashboardNeedsAttentionResponse NeedsAttention
);

public sealed record DashboardTotalsResponse(
    int Albums,
    int Artists,
    int Genres,
    int Tracks
);

public sealed record DashboardNeedsAttentionResponse(
    int AlbumsWithoutArtists,
    int AlbumsWithoutGenres,
    int AlbumsWithoutTracks,
    int AlbumsWithoutPrimaryGenre,
    int TracksWithoutAlbums
);