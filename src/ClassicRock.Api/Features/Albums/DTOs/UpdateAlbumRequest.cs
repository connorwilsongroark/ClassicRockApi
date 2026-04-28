namespace ClassicRock.Api.Features.Albums;

public sealed record UpdateAlbumRequest (
    string Title,
    int ReleaseYear,
    decimal? CuratedScore
);