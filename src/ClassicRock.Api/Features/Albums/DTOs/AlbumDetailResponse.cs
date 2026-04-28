namespace ClassicRock.Api.Features.Albums;

public sealed record AlbumDetailResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    IReadOnlyList<AlbumArtistResponse> Artists,
    IReadOnlyList<AlbumGenreResponse> Genres
);