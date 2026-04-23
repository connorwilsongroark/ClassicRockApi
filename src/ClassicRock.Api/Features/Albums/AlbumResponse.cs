namespace ClassicRock.Api.Features.Albums;

public sealed record AlbumsResponse(
    Guid Id,
    Guid ArtistId,
    string ArtistName,
    string Title,
    int ReleaseYear,
    // string? Genre,
    // string? Subgenre,
    decimal? CuratedScore
);