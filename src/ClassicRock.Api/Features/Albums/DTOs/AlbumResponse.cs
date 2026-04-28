namespace ClassicRock.Api.Features.Albums;

public sealed record AlbumResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    string? PrimaryArtistName,
    string? PrimaryGenreName
);