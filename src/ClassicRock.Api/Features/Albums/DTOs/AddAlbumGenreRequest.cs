namespace ClassicRock.Api.Features.Albums;

public sealed record AddAlbumGenreRequest(
    Guid GenreId,
    bool IsPrimary
);