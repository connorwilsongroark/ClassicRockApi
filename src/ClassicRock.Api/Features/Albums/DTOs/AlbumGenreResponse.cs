namespace ClassicRock.Api.Features.Albums;

public sealed record AlbumGenreResponse(
    Guid GenreId,
    string GenreName,
    bool IsPrimary
);