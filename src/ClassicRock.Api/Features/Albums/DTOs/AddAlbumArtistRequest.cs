namespace ClassicRock.Api.Features.Albums;

public sealed record AddAlbumArtistRequest(
    Guid ArtistId,
    int Role
);